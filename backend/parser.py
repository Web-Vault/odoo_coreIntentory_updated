from sqlalchemy.orm import Session
from . import models

def get_heuristic_reply(user_msg: str, db: Session):
    user_msg = user_msg.lower()
    products = db.query(models.Product).all()
    branches = db.query(models.Branch).all()
    
    # --- Rule Matching Engine ---

    # 1. Branch-specific stock query
    mentioned_branch = None
    branch_map = {
        "mumbai": "Mumbai — Bandra",
        "pune": "Pune — Koregaon",
        "delhi": "Delhi — Connaught"
    }
    
    for b_key, b_full in branch_map.items():
        if b_key in user_msg:
            mentioned_branch = b_full
            break
            
    if mentioned_branch and ("stock" in user_msg or "inventory" in user_msg or "available" in user_msg or "have" in user_msg):
        branch_products = [p for p in products if p.branch == mentioned_branch]
        if not branch_products:
            branch_products = [p for p in products if mentioned_branch.split(" ")[0] in p.branch]
        
        if not branch_products:
            return f"I don't see any stock records for the {mentioned_branch} branch."
        
        specific_product = None
        for p in products:
            if p.name.lower() in user_msg:
                specific_product = p.name
                break
        
        if specific_product:
            p = next((prod for prod in branch_products if prod.name == specific_product), None)
            if p:
                return f"In the {mentioned_branch} branch, you have {p.on_hand} {p.unit} of {p.name}. Its status is {p.status}."
            else:
                return f"I couldn't find {specific_product} in the {mentioned_branch} branch inventory."
        
        total_items = len(branch_products)
        total_qty = sum(p.on_hand for p in branch_products)
        low_items = [p.name for p in branch_products if p.status in ["Critical", "Low Stock"]]
        low_txt = f" Items needing attention: {', '.join(low_items)}." if low_items else " All items are healthy."
        return f"The {mentioned_branch} branch currently manages {total_items} ingredients with a total stock of {total_qty:.1f} units.{low_txt}"

    # 2. Low stock summary (Branch-aware)
    if "low" in user_msg or "critical" in user_msg or "running out" in user_msg:
        if mentioned_branch:
            low_stock = [p for p in products if p.status in ["Critical", "Low Stock"] and p.branch == mentioned_branch]
            if not low_stock:
                return f"The {mentioned_branch} branch has no items with low stock. Everything is healthy!"
            items = ", ".join([f"{p.name}" for p in low_stock])
            return f"In the {mentioned_branch} branch, you have {len(low_stock)} items running low: {items}."
        else:
            low_stock = [p for p in products if p.status in ["Critical", "Low Stock"]]
            if not low_stock:
                return "All your ingredients are currently at healthy stock levels!"
            items = ", ".join([f"{p.name} ({p.branch})" for p in low_stock[:5]])
            return f"You have {len(low_stock)} items running low across all branches, including: {items}. Check the Auto-Reorder tab for more."

    # 3. Specific Product Price query
    if "price" in user_msg or "cost" in user_msg:
        for p in products:
            if p.name.lower() in user_msg:
                return f"The price for {p.name} is {p.price} across all branches."

    # 4. General Product Stock query (across all branches)
    if "stock" in user_msg or "inventory" in user_msg or "how many" in user_msg:
        for p in products:
            if p.name.lower() in user_msg:
                all_branch_stock = [prod for prod in products if prod.name == p.name]
                total = sum([prod.on_hand for prod in all_branch_stock])
                details = ", ".join([f"{prod.branch}: {prod.on_hand} {prod.unit}" for prod in all_branch_stock])
                return f"You have a total of {total:.1f} {p.unit} of {p.name} across all branches. Breakdown: {details}."

    # 5. General product/ingredient listing
    if ("list" in user_msg and ("products" in user_msg or "ingredients" in user_msg or "items" in user_msg)) or "all ingredients" in user_msg or "all products" in user_msg or "what ingredients" in user_msg:
        unique_product_names = sorted(list(set([p.name for p in products])))
        if not unique_product_names:
            return "I couldn't find any products in the inventory."
        return f"We currently manage the following ingredients: {', '.join(unique_product_names)}."

    # 6. Branch comparison
    if "which branch" in user_msg and ("stock" in user_msg or "more" in user_msg):
        return f"You are currently managing {len(branches)} branches: {', '.join([b.name for b in branches])}. Mumbai usually has the highest inventory volume."

    # Fallback Reply
    return "I can help with questions about stock, prices, and low inventory. Please ask me about a specific branch or ingredient!"
