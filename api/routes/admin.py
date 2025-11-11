from fastapi import APIRouter, Depends, HTTPException
from typing import List
import models
import auth
from database import db
import secrets
import string

router = APIRouter()

@router.post("/users", response_model=dict)
async def create_user_by_admin(
    user_create: models.AdminUserCreate,
    current_admin: models.UserPublic = Depends(auth.get_current_admin_user)
):
    """
    Create a new user as an admin.
    """
    db_user = db.users.find_one({"username": user_create.username})
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Generate a random password
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for i in range(12))

    hashed_password = auth.get_password_hash(password)
    user_in_db = models.UserInDB(
        username=user_create.username,
        hashed_password=hashed_password,
        password_change_required=True
    )
    db.users.insert_one(user_in_db.model_dump())

    return {"username": user_create.username, "password": password}

@router.delete("/chat/history/{username}", status_code=204)
async def clear_user_chat_history(
    username: str,
    current_admin: models.UserPublic = Depends(auth.get_current_admin_user)
):
    """
    Clear all chat history for a specific user.
    """
    db.messages.delete_many({"$or": [{"sender": username}, {"recipient": username}]})

@router.get("/users/{username}/notes", response_model=List[models.NoteInDB])
async def get_notes(
    username: str,
    current_user: models.UserPublic = Depends(auth.get_current_admin_user)
):
    """
    Get all notes for a specific user.
    """
    notes = db.notes.find({"username": username})
    return list(notes)

@router.post("/users/{username}/notes", response_model=models.NoteInDB)
async def add_note(
    username: str,
    note_create: models.NoteCreate,
    current_user: models.UserPublic = Depends(auth.get_current_admin_user)
):
    """
    Add a new note to a user.
    """
    note = models.Note(
        username=username,
        admin_username=current_user.username,
        content=note_create.content
    )
    db.notes.insert_one(note.dict())
    return note
