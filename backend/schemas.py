from pydantic import BaseModel, Field
from typing import List, Optional

class StatSchema(BaseModel):
    id: Optional[int] = None
    label: str
    value: str
    trend: str
    trendType: str = Field(validation_alias="trend_type")
    class Config:
        from_attributes = True
        populate_by_name = True

class OperationSummarySchema(BaseModel):
    id: Optional[int] = None
    label: str
    value: int
    sub: str
    badge: str
    badgeColor: str = Field(validation_alias="badge_color")
    class Config:
        from_attributes = True
        populate_by_name = True

class RecentOperationSchema(BaseModel):
    ref: str
    type: str
    typeColor: str = Field(validation_alias="type_color")
    from_pos: Optional[str] = Field(None, validation_alias="from_loc", serialization_alias="from")
    to_pos: Optional[str] = Field(None, validation_alias="to_loc", serialization_alias="to")
    item: str
    qty: str
    status: str
    statusColor: str = Field(validation_alias="status_color")
    date: str
    class Config:
        from_attributes = True
        populate_by_name = True

class RecentOperationCreate(BaseModel):
    ref: str
    type: str
    type_color: str
    from_loc: str
    to_loc: str
    item: str
    qty: str
    status: str
    status_color: str
    date: str

class ProductSchema(BaseModel):
    sku: str
    name: str
    category: str
    categoryColor: str = Field(validation_alias="category_color")
    branch: str
    onHand: float = Field(validation_alias="on_hand")
    unit: str
    forecast: float
    rule: str
    price: str
    status: str
    statusColor: str = Field(validation_alias="status_color")
    progress: int
    reorderDate: Optional[str] = Field(None, validation_alias="reorder_date")
    reorderQty: float = Field(0.0, validation_alias="reorder_qty")
    class Config:
        from_attributes = True
        populate_by_name = True

class ProductUpdate(BaseModel):
    on_hand: Optional[float] = None
    reorder_date: Optional[str] = None
    reorder_qty: Optional[float] = None

class TransferRequest(BaseModel):
    from_branch: str
    to_branch: str
    product_sku: str
    quantity: float

class ProductCreate(BaseModel):
    sku: str
    name: str
    category: str
    category_color: str
    branch: str
    on_hand: float
    unit: str
    forecast: float
    rule: str
    price: str
    status: str
    status_color: str
    progress: int

class ForecastSchema(BaseModel):
    day: str
    value: int
    color: str
    border: Optional[str] = None
    desc: str = Field(validation_alias="description")
    class Config:
        from_attributes = True
        populate_by_name = True

class BranchSchema(BaseModel):
    name: str
    loc: str
    status: str
    statusColor: str = Field(validation_alias="status_color")
    capacity: str
    items: int
    value: str
    score: str
    util: int
    utilDesc: str = Field(validation_alias="util_desc")
    class Config:
        from_attributes = True
        populate_by_name = True

class AIReplySchema(BaseModel):
    question: str
    reply: str
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    name: str
    role: Optional[str] = "Manager"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserSchema(UserBase):
    id: int
    class Config:
        from_attributes = True

class DashboardDataSchema(BaseModel):
    stats: List[StatSchema]
    operations: List[OperationSummarySchema]
    recentOperations: List[RecentOperationSchema]
    products: List[ProductSchema]
    forecast: List[ForecastSchema]
    branches: List[BranchSchema]
    aiReplies: List[AIReplySchema]
