import json
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal, engine
from backend import models

def seed_db():
    # Load JSON data
    # The path should be relative to the project root
    json_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "src", "data", "dashboardData.json")
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    db = SessionLocal()
    
    try:
        # Drop all tables and recreate them to ensure schema matches models
        models.Base.metadata.drop_all(bind=engine)
        models.Base.metadata.create_all(bind=engine)

        # Clear existing data (optional now as tables are fresh)
        # db.query(models.Stat).delete()
        db.query(models.OperationSummary).delete()
        db.query(models.RecentOperation).delete()
        db.query(models.Product).delete()
        db.query(models.Forecast).delete()
        db.query(models.Branch).delete()
        db.query(models.AIReply).delete()
        db.query(models.User).delete()
        
        # Seed Stats
        for s in data["stats"]:
            db_stat = models.Stat(
                label=s["label"],
                value=str(s["value"]),
                trend=s["trend"],
                trend_type=s["trendType"]
            )
            db.add(db_stat)
            
        # Seed OperationSummaries
        for op in data["operations"]:
            db_op = models.OperationSummary(
                label=op["label"],
                value=op["value"],
                sub=op["sub"],
                badge=op["badge"],
                badge_color=op["badgeColor"]
            )
            db.add(db_op)
            
        # Seed RecentOperations
        for ro in data["recentOperations"]:
            db_ro = models.RecentOperation(
                ref=ro["ref"],
                type=ro["type"],
                type_color=ro["typeColor"],
                from_loc=ro["from"],
                to_loc=ro["to"],
                item=ro["item"],
                qty=ro["qty"],
                status=ro["status"],
                status_color=ro["statusColor"],
                date=ro["date"]
            )
            db.add(db_ro)
            
        # Seed Products with consistent items across all 3 branches
        base_products = [
            {"name": "Arabica Coffee Beans", "category": "Coffee", "categoryColor": "amber", "unit": "kg", "price": "₹850/kg", "rule": "Min-Max"},
            {"name": "Robusta Coffee Beans", "category": "Coffee", "categoryColor": "amber", "unit": "kg", "price": "₹650/kg", "rule": "Min-Max"},
            {"name": "Whole Milk", "category": "Dairy", "categoryColor": "sky", "unit": "L", "price": "₹65/L", "rule": "Daily"},
            {"name": "Oat Milk", "category": "Dairy Alt", "categoryColor": "sky", "unit": "L", "price": "₹160/L", "rule": "MTO"},
            {"name": "Vanilla Syrup", "category": "Syrups", "categoryColor": "berry", "unit": "btl", "price": "₹420/btl", "rule": "Min-Max"},
            {"name": "Caramel Syrup", "category": "Syrups", "categoryColor": "berry", "unit": "btl", "price": "₹450/btl", "rule": "Min-Max"},
            {"name": "Butter Croissants", "category": "Bakery", "categoryColor": "caramel", "unit": "pcs", "price": "₹120/pc", "rule": "Daily"},
            {"name": "Chocolate Muffins", "category": "Bakery", "categoryColor": "caramel", "unit": "pcs", "price": "₹95/pc", "rule": "Daily"},
            {"name": "Paper Cups 8oz", "category": "Packaging", "categoryColor": "mocha", "unit": "pcs", "price": "₹4/pc", "rule": "Bulk"}
        ]
        
        branches = ["Mumbai", "Pune", "Delhi"]
        import random

        for branch in branches:
            for idx, p in enumerate(base_products):
                # Randomize onHand stock for each branch
                on_hand = round(random.uniform(5, 50), 1)
                if p["unit"] == "pcs":
                    on_hand = random.randint(10, 100)
                
                # Determine status based on on_hand
                status = "OK"
                status_color = "green"
                reorder_qty = 0.0
                if on_hand < 10:
                    status = "Low Stock"
                    status_color = "amber"
                    reorder_qty = 25.0 # Predefined reorder quantity
                if on_hand < 5:
                    status = "Critical"
                    status_color = "red"
                    reorder_qty = 50.0 # Urgent reorder quantity

                db_p = models.Product(
                    sku=f"{p['name'][:2].upper()}-{branch[:3].upper()}-{100+idx}",
                    name=p["name"],
                    category=p["category"],
                    category_color=p["categoryColor"],
                    branch=branch,
                    on_hand=on_hand,
                    unit=p["unit"],
                    forecast=round(random.uniform(-5, 10), 1),
                    rule=p["rule"],
                    price=p["price"],
                    status=status,
                    status_color=status_color,
                    progress=min(100, int((on_hand / 100) * 100)),
                    reorder_qty=reorder_qty
                )
                db.add(db_p)
            
        # Seed Forecasts
        for f in data["forecast"]:
            db_f = models.Forecast(
                day=f["day"],
                value=f["value"],
                color=f["color"],
                border=f.get("border"),
                description=f["desc"]
            )
            db.add(db_f)
            
        # Seed Branches
        for b in data["branches"]:
            db_b = models.Branch(
                name=b["name"],
                loc=b["loc"],
                status=b["status"],
                status_color=b["statusColor"],
                capacity=b["capacity"],
                items=b["items"],
                value=b["value"],
                score=b["score"],
                util=b["util"],
                util_desc=b["utilDesc"]
            )
            db.add(db_b)
            
        # Seed AI Replies
        for q, r in data["aiReplies"].items():
            db_reply = models.AIReply(
                question=q,
                reply=r
            )
            db.add(db_reply)
            
        # Seed Default User
        db_user = models.User(
            email="admin@brewiq.com",
            password="password123",
            name="BrewIQ Admin",
            role="System Manager"
        )
        db.add(db_user)
            
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"An error occurred: {e}")
    finally:
        db.close()

import mysql.connector
from mysql.connector import errorcode
from backend.database import MYSQL_USER, MYSQL_PASSWORD, MYSQL_HOST, MYSQL_PORT, MYSQL_DB

def create_database():
    try:
        cnx = mysql.connector.connect(user=MYSQL_USER, password=MYSQL_PASSWORD, host=MYSQL_HOST, port=MYSQL_PORT)
        cursor = cnx.cursor()
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {MYSQL_DB} DEFAULT CHARACTER SET 'utf8'")
        print(f"Database {MYSQL_DB} created or already exists.")
        cnx.close()
    except mysql.connector.Error as err:
        print(f"Failed creating database: {err}")
        # We don't exit here because the DB might already exist and SQLAlchemy might handle it,
        # but usually this means connection failed altogether.

if __name__ == "__main__":
    create_database()
    # Ensure tables are created
    models.Base.metadata.create_all(bind=engine)
    seed_db()
