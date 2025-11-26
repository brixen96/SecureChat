from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timezone

class UserInDB(BaseModel):
    username: str
    hashed_password: str
    role: str = "user"
    password_change_required: bool = False

class UserCreate(BaseModel):
    username: str
    password: str = Field(..., min_length=8, max_length=72)

class AdminUserCreate(BaseModel):
    username: str

class UserPublic(BaseModel):
    username: str
    role: str

class UserPublicWithUnread(UserPublic):
    unread_count: int
    last_message_timestamp: Optional[datetime] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserPublic
    password_change_required: Optional[bool] = None

class TokenData(BaseModel):
    username: Optional[str] = None

class Message(BaseModel):
    sender: str
    recipient: Optional[str] = None
    text: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    read: bool = False

class PasswordChange(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8, max_length=72)

class PushSubscription(BaseModel):
    endpoint: str
    keys: dict

class SubscriptionInDB(PushSubscription):
    username: str

class Note(BaseModel):
    username: str
    admin_username: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class NoteInDB(Note):
    pass

class NoteCreate(BaseModel):
    content: str

class Product(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductInDB(Product):
    id: Optional[str] = None

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    price: float = Field(..., gt=0)

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    price: Optional[float] = Field(None, gt=0)