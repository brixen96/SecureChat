from fastapi import APIRouter, Depends, HTTPException, status
import models
import auth
from database import db

router = APIRouter()

@router.post("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    password_change: models.PasswordChange,
    current_user: models.UserPublic = Depends(auth.get_current_user)
):
    """
    Change the current user's password.
    """
    user_in_db = db.users.find_one({"username": current_user.username})
    if not user_in_db:
        raise HTTPException(status_code=404, detail="User not found")

    if not auth.verify_password(password_change.old_password, user_in_db["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    new_hashed_password = auth.get_password_hash(password_change.new_password)
    db.users.update_one(
        {"username": current_user.username},
        {"$set": {"hashed_password": new_hashed_password, "password_change_required": False}}
    )