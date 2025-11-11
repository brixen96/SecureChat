from fastapi import APIRouter, Depends
from typing import List
import models
from auth import get_current_user
from database import db
from datetime import datetime, timezone

router = APIRouter()

@router.get("/time")
async def get_server_time():
    return {
        "server_time_utc": datetime.now(timezone.utc),
        "server_time_local": datetime.now()
    }

@router.get("/", response_model=List[models.UserPublicWithUnread])
async def get_all_users(current_user: models.UserPublic = Depends(get_current_user)):
    if current_user.role != "admin":
        return []
    users = list(db.users.find({"role": "user"}))
    users_with_unread = []
    for user in users:
        unread_count = db.messages.count_documents({"sender": user["username"], "read": False})
        last_message = db.messages.find_one({"$or": [{"sender": user["username"]}, {"recipient": user["username"]}]}, sort=[("timestamp", -1)])
        user_public = models.UserPublicWithUnread(
            **user, 
            unread_count=unread_count,
            last_message_timestamp=last_message["timestamp"] if last_message else None
        )
        users_with_unread.append(user_public)
    return users_with_unread
