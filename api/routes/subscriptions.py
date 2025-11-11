from fastapi import APIRouter, Depends, HTTPException
import models
import auth
from database import db

router = APIRouter()

@router.post("/", status_code=201)
async def create_subscription(
    subscription: models.PushSubscription,
    current_user: models.UserPublic = Depends(auth.get_current_user)
):
    """
    Create a new push notification subscription.
    """
    subscription_in_db = models.SubscriptionInDB(
        **subscription.model_dump(),
        username=current_user.username
    )
    db.subscriptions.insert_one(subscription_in_db.model_dump())
    return {"message": "Subscription created successfully"}
