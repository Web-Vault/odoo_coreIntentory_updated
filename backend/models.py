from sqlalchemy import Column, Integer, String, Float, Text
from backend.database import Base

class Stat(Base):
    __tablename__ = "stats"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100))
    value = Column(String(100))
    trend = Column(String(100))
    trend_type = Column(String(50))

class OperationSummary(Base):
    __tablename__ = "operation_summaries"
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(100))
    value = Column(Integer)
    sub = Column(String(255))
    badge = Column(String(100))
    badge_color = Column(String(50))

class RecentOperation(Base):
    __tablename__ = "recent_operations"
    id = Column(Integer, primary_key=True, index=True)
    ref = Column(String(100))
    type = Column(String(100))
    type_color = Column(String(50))
    from_loc = Column(String(100))
    to_loc = Column(String(100))
    item = Column(String(255))
    qty = Column(String(100))
    status = Column(String(100))
    status_color = Column(String(50))
    date = Column(String(100))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, index=True)
    name = Column(String(255))
    category = Column(String(100))
    category_color = Column(String(50))
    branch = Column(String(100))
    on_hand = Column(Float)
    unit = Column(String(50))
    forecast = Column(Float)
    rule = Column(String(100))
    price = Column(String(100))
    status = Column(String(100))
    status_color = Column(String(50))
    progress = Column(Integer)
    reorder_date = Column(String(100), nullable=True)
    reorder_qty = Column(Float, default=0.0)

class Forecast(Base):
    __tablename__ = "forecasts"
    id = Column(Integer, primary_key=True, index=True)
    day = Column(String(50))
    value = Column(Integer)
    color = Column(String(50))
    border = Column(String(50), nullable=True)
    description = Column(Text)

class Branch(Base):
    __tablename__ = "branches"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    loc = Column(String(255))
    status = Column(String(100))
    status_color = Column(String(50))
    capacity = Column(String(100))
    items = Column(Integer)
    value = Column(String(100))
    score = Column(String(50))
    util = Column(Integer)
    util_desc = Column(String(255))

class AIReply(Base):
    __tablename__ = "ai_replies"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String(255), unique=True)
    reply = Column(Text)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    password = Column(String(255))
    name = Column(String(255))
    role = Column(String(50), default="Manager")
