from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth as auth_router
from routes import chat as chat_router
from routes import users as users_router
from routes import admin as admin_router
from routes import user as user_router
from routes import subscriptions as subscriptions_router
from routes import menu as menu_router
from datetime import datetime

def datetime_encoder(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Object of type {obj.__class__.__name__} is not JSON serializable")

app = FastAPI(
    json_encoders={
        datetime: datetime_encoder
    }
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your Angular app's URL
    #allow_origins=["http://localhost:4200", "http://87.62.99.97:8006"],  # Adjust this to your Angular app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router, prefix="/auth", tags=["auth"])
app.include_router(chat_router.router, prefix="/chat", tags=["chat"])
app.include_router(users_router.router, prefix="/users", tags=["users"])
app.include_router(admin_router.router, prefix="/admin", tags=["admin"])
app.include_router(user_router.router, prefix="/user", tags=["user"])
app.include_router(subscriptions_router.router, prefix="/subscriptions", tags=["subscriptions"])
app.include_router(menu_router.router, prefix="/menu", tags=["menu"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the SecureChat API v1.2"}