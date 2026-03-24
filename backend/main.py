from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from .database import get_db, engine, Base
from . import models, schemas
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from datetime import datetime
import random
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load .env from the current directory (backend/)
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(dotenv_path=env_path)

api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    # Use a dummy key if not set, but handle it in the chat function
    api_key = "missing_key"

client = OpenAI(api_key=api_key)

# Create database tables if they don't exist
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with specific frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from sqlalchemy import func, or_

def refresh_stats(db: Session):
    # 1. Update Ingredients count
    ingredient_count = db.query(models.Product).count()
    db.query(models.Stat).filter(models.Stat.label == "Ingredients").update({"value": str(ingredient_count)})
    
    # 2. Update Low Stock count
    low_stock_count = db.query(models.Product).filter(
        or_(
            models.Product.status == "Low",
            models.Product.status == "Low Stock",
            models.Product.status == "Critical",
            models.Product.status_color == "red",
            models.Product.status_color == "amber"
        )
    ).count()
    db.query(models.Stat).filter(models.Stat.label == "Low Stock").update({"value": str(low_stock_count)})
    
    # 3. Update Branch Items count
    branches = db.query(models.Branch).all()
    for branch in branches:
        branch_item_count = db.query(models.Product).filter(models.Product.branch == branch.name).count()
        branch.items = branch_item_count
        
    db.commit()

@app.get("/")
def read_root():
    return {"message": "Welcome to the BrewIQ API!"}

@app.get("/api/dashboard", response_model=schemas.DashboardDataSchema)
def get_dashboard_data(db: Session = Depends(get_db)):
    stats = db.query(models.Stat).all()
    operations = db.query(models.OperationSummary).all()
    recent_ops = db.query(models.RecentOperation).order_by(models.RecentOperation.id.desc()).limit(10).all()
    products = db.query(models.Product).all()
    forecasts = db.query(models.Forecast).all()
    branches = db.query(models.Branch).all()
    ai_replies = db.query(models.AIReply).all()

    return {
        "stats": stats,
        "operations": operations,
        "recentOperations": recent_ops,
        "products": products,
        "forecast": forecasts,
        "branches": branches,
        "aiReplies": ai_replies
    }

@app.post("/api/ai/chat")
def ai_chat(query: dict, db: Session = Depends(get_db)):
    user_msg = query.get("message", "").lower()
    
    # 1. Fetch current database state for context
    products = db.query(models.Product).all()
    stats = db.query(models.Stat).all()
    branches = db.query(models.Branch).all()
    recent_ops = db.query(models.RecentOperation).order_by(models.RecentOperation.id.desc()).limit(5).all()
    
    # Format context for AI
    product_context = "\n".join([
        f"- {p.name} (SKU: {p.sku}): {p.on_hand} {p.unit} in {p.branch}. Status: {p.status}, Price: {p.price}" 
        for p in products
    ])
    stat_context = "\n".join([f"- {s.label}: {s.value}" for s in stats])
    branch_context = "\n".join([f"- {b.name}: {b.items} items" for b in branches])
    op_context = "\n".join([f"- {o.type}: {o.item} ({o.qty}) from {o.from_loc} to {o.to_loc} on {o.date}" for o in recent_ops])

    system_prompt = f"""
    You are BrewIQ's expert inventory AI assistant. You have full access to the current café inventory database.
    Your goal is to provide accurate, helpful, and concise answers based ONLY on the data provided below.

    CURRENT INVENTORY DATA:
    {product_context}

    CURRENT DASHBOARD STATS:
    {stat_context}

    BRANCHES:
    {branch_context}

    RECENT OPERATIONS:
    {op_context}

    INSTRUCTIONS:
    1. Always use the provided data to answer questions.
    2. If a user asks for prices, stock levels, or branch info, give exact numbers from the context.
    3. If the data is not in the context, politely say you don't have that information.
    4. Keep your tone professional, friendly, and efficient (like a senior café manager).
    5. You can perform basic calculations (e.g., total stock across all branches) if asked.
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_msg}
            ],
            temperature=0.3, # Low temperature for factual accuracy
            max_tokens=200
        )
        reply = response.choices[0].message.content.strip()
        return {"reply": reply}
    except Exception as e:
        print(f"OpenAI Error: {e}")
        # Fallback to a simple heuristic if OpenAI fails
        if "stock" in user_msg or "inventory" in user_msg:
            total_stock = sum([p.on_hand for p in products])
            return {"reply": f"I'm having trouble with my advanced brain, but I can tell you that we have a total of {total_stock:.1f} units in stock right now."}
        return {"reply": "I'm sorry, I'm experiencing a technical issue with my AI core. Please try again in a moment."}

@app.post("/api/operations", response_model=schemas.RecentOperationSchema)
def create_operation(operation: schemas.RecentOperationCreate, db: Session = Depends(get_db)):
    op_data = operation.dict()
    if not op_data.get('date') or op_data.get('date') == 'Just now':
        op_data['date'] = datetime.now().strftime("%b %d, %H:%M")
    db_op = models.RecentOperation(**op_data)
    db.add(db_op)
    db.commit()
    db.refresh(db_op)
    return db_op

@app.patch("/api/products/{sku}", response_model=schemas.ProductSchema)
def update_product_inventory(sku: str, update: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.sku == sku).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if update.on_hand is not None:
        db_product.on_hand = update.on_hand
        
        # Update progress and status based on on_hand
        db_product.progress = min(100, int((db_product.on_hand / 500) * 100))
        if db_product.on_hand < 5:
            db_product.status = "Critical"
            db_product.status_color = "red"
        elif db_product.on_hand < 15:
            db_product.status = "Low Stock"
            db_product.status_color = "amber"
        else:
            db_product.status = "OK"
            db_product.status_color = "green"
            
    if update.reorder_date is not None:
        db_product.reorder_date = update.reorder_date
        
    if update.reorder_qty is not None:
        db_product.reorder_qty = update.reorder_qty
    
    db.commit()
    db.refresh(db_product)
    
    # Refresh all stats
    refresh_stats(db)
    
    # Return mapped to frontend camelCase
    return {
        "sku": db_product.sku,
        "name": db_product.name,
        "category": db_product.category,
        "categoryColor": db_product.category_color,
        "branch": db_product.branch,
        "onHand": db_product.on_hand,
        "unit": db_product.unit,
        "forecast": db_product.forecast,
        "rule": db_product.rule,
        "price": db_product.price,
        "status": db_product.status,
        "statusColor": db_product.status_color,
        "progress": db_product.progress,
        "reorderDate": db_product.reorder_date,
        "reorderQty": db_product.reorder_qty
    }

@app.post("/api/products", response_model=schemas.ProductSchema)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = db.query(models.Product).filter(models.Product.sku == product.sku).first()
    if db_product:
        raise HTTPException(status_code=400, detail="Product with this SKU already exists")
    
    new_product = models.Product(**product.dict())
    
    # Set status and progress for new product
    new_product.progress = min(100, int((new_product.on_hand / 500) * 100))
    if new_product.on_hand < 5:
        new_product.status = "Critical"
        new_product.status_color = "red"
    elif new_product.on_hand < 15:
        new_product.status = "Low Stock"
        new_product.status_color = "amber"
    else:
        new_product.status = "OK"
        new_product.status_color = "green"

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    # Refresh all stats
    refresh_stats(db)
    
    return {
        "sku": new_product.sku,
        "name": new_product.name,
        "category": new_product.category,
        "categoryColor": new_product.category_color,
        "branch": new_product.branch,
        "onHand": new_product.on_hand,
        "unit": new_product.unit,
        "forecast": new_product.forecast,
        "rule": new_product.rule,
        "price": new_product.price,
        "status": new_product.status,
        "statusColor": new_product.status_color,
        "progress": new_product.progress
    }

@app.post("/api/login", response_model=schemas.UserSchema)
def login(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_login.email).first()
    if not user or user.password != user_login.password:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user

@app.post("/api/register", response_model=schemas.UserSchema)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/api/transfer", response_model=schemas.RecentOperationSchema)
def transfer_product(transfer: schemas.TransferRequest, db: Session = Depends(get_db)):
    # 1. Find the source product
    source_product = db.query(models.Product).filter(
        models.Product.sku == transfer.product_sku,
        models.Product.branch == transfer.from_branch
    ).first()
    
    if not source_product:
        raise HTTPException(status_code=404, detail="Source product not found")
    
    if source_product.on_hand < transfer.quantity:
        raise HTTPException(status_code=400, detail="Insufficient stock in source branch")
    
    # 2. Find or create the target product
    target_product = db.query(models.Product).filter(
        models.Product.name == source_product.name,
        models.Product.branch == transfer.to_branch
    ).first()
    
    if not target_product:
        # Create a new SKU for the target branch
        # Simple logic: original_sku + "-" + first char of branch (just a placeholder logic)
        new_sku = f"{source_product.sku}-{transfer.to_branch[:3].upper()}"
        # Ensure new SKU is unique
        existing_sku = db.query(models.Product).filter(models.Product.sku == new_sku).first()
        if existing_sku:
             new_sku = f"{new_sku}-{random.randint(100, 999)}"

        target_product = models.Product(
            sku=new_sku,
            name=source_product.name,
            category=source_product.category,
            category_color=source_product.category_color,
            branch=transfer.to_branch,
            on_hand=0,
            unit=source_product.unit,
            forecast=0,
            rule=source_product.rule,
            price=source_product.price,
            status="OK",
            status_color="green",
            progress=0
        )
        db.add(target_product)
        db.flush() # Get the ID if needed
    
    # 3. Update stock levels
    source_product.on_hand -= transfer.quantity
    target_product.on_hand += transfer.quantity
    
    # Update progress and status based on on_hand
    for p in [source_product, target_product]:
        p.progress = min(100, int((p.on_hand / 500) * 100))
        if p.on_hand < 5:
            p.status = "Critical"
            p.status_color = "red"
        elif p.on_hand < 15:
            p.status = "Low Stock"
            p.status_color = "amber"
        else:
            p.status = "OK"
            p.status_color = "green"
    
    # 4. Create operation log
    new_op = models.RecentOperation(
        ref=f"WH/TR/{random.randint(1000, 9999)}",
        type="Internal Transfer",
        type_color="blue",
        from_loc=transfer.from_branch,
        to_loc=transfer.to_branch,
        item=source_product.name,
        qty=f"{transfer.quantity} {source_product.unit}",
        status="Done",
        status_color="green",
        date=datetime.now().strftime("%b %d, %H:%M")
    )
    db.add(new_op)
    
    db.commit()
    db.refresh(new_op)
    
    # Refresh all stats
    refresh_stats(db)
    
    return new_op

import random # Added for transfer_product

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
