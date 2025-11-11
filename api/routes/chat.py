from fastapi import APIRouter, WebSocket, Depends, WebSocketDisconnect
import models
from auth import get_current_user_ws, get_current_user
from websocket_manager import manager
from database import db
import json
from push import send_push_notification
from typing import List, Optional

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, user: models.UserPublic = Depends(get_current_user_ws)):
    await manager.connect(websocket, user.username)
    try:
        while True:
            message_data = await websocket.receive_json()

            if user.role == "user":
                # Basic user sends a message to admins
                admins = [admin["username"] for admin in db.users.find({"role": "admin"})]
                message = models.Message(sender=user.username, text=message_data["text"])
                db.messages.insert_one(message.model_dump())
                await manager.broadcast_to_admins(message.model_dump_json(), admins)
                # Also send the message back to the user
                await manager.send_personal_message(message.model_dump_json(), user.username)

                # Send push notifications to admins
                for admin_username in admins:
                    subscription = db.subscriptions.find_one({"username": admin_username})
                    if subscription:
                        send_push_notification(subscription, f"New message from {user.username}", message.text)
            
            elif user.role == "admin":
                # Admin sends a message to a specific user
                recipient = message_data.get("recipient")
                if recipient:
                    message = models.Message(sender=user.username, text=message_data["text"], recipient=recipient)
                    db.messages.insert_one(message.model_dump())
                    await manager.send_personal_message(message.model_dump_json(), recipient)
                    
                    # Send to all admins
                    admins = [admin["username"] for admin in db.users.find({"role": "admin"})]
                    await manager.broadcast_to_admins(message.model_dump_json(), admins)

                    # Send push notification to the recipient
                    subscription = db.subscriptions.find_one({"username": recipient})
                    if subscription:
                        send_push_notification(subscription, f"New message from {user.username}", message.text)

    except WebSocketDisconnect:
        manager.disconnect(websocket, user.username)
    except Exception as e:
        manager.disconnect(websocket, user.username)

@router.get("/messages", response_model=List[models.Message])
async def get_message_history(username: Optional[str] = None, current_user: models.UserPublic = Depends(get_current_user)):
    if current_user.role == "admin":
        if not username:
            return []

        # Mark user messages as read
        db.messages.update_many(
            {"sender": username, "recipient": None, "read": False},
            {"$set": {"read": True}}
        )

        messages = list(db.messages.find({
            "$or": [
                {"sender": username, "recipient": None},
                {"sender": current_user.username, "recipient": username}
            ]
        }).sort("timestamp", 1))
    
        return [models.Message(**msg) for msg in messages]
    
    elif current_user.role == "user":
        admins = [admin["username"] for admin in db.users.find({"role": "admin"})]
        # Mark admin messages as read
        db.messages.update_many(
            {"sender": {"$in": admins}, "recipient": current_user.username, "read": False},
            {"$set": {"read": True}}
        )

        messages = list(db.messages.find({
            "$or": [
                {"sender": current_user.username},
                {"recipient": current_user.username}
            ]
        }).sort("timestamp", 1))
        return [models.Message(**msg) for msg in messages]
    
    return []

@router.get("/unread-count")
async def get_unread_count(current_user: models.UserPublic = Depends(get_current_user)):
    if current_user.role == "admin":
        # Count unread messages from all users to admins
        count = db.messages.count_documents({"read": False, "recipient": None})
        return count
    elif current_user.role == "user":
        # Count unread messages from admins to the user
        admins = [admin["username"] for admin in db.users.find({"role": "admin"})]
        count = db.messages.count_documents({
            "read": False, 
            "sender": {"$in": admins},
            "recipient": current_user.username
        })
        return count
    return 0

@router.get("/last-unread", response_model=Optional[models.Message])
async def get_last_unread_message(current_user: models.UserPublic = Depends(get_current_user)):
    if current_user.role == "user":
        admins = [admin["username"] for admin in db.users.find({"role": "admin"})]
        last_message = db.messages.find_one(
            {
                "read": False,
                "sender": {"$in": admins},
                "recipient": current_user.username
            },
            sort=[("timestamp", -1)]
        )
        if last_message:
            return models.Message(**last_message)
    return None
