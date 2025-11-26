from fastapi import APIRouter, Depends, HTTPException
from typing import List
import models
from auth import get_current_user
from database import db
from bson import ObjectId

router = APIRouter()

@router.get("/", response_model=List[models.ProductInDB])
async def get_all_products(current_user: models.UserPublic = Depends(get_current_user)):
    """
    Get all products in the menu. Available to all authenticated users.
    """
    products = list(db.products.find().sort("timestamp", -1))
    for product in products:
        product["id"] = str(product.pop("_id"))
    return [models.ProductInDB(**product) for product in products]

@router.post("/", response_model=models.ProductInDB, status_code=201)
async def create_product(
    product: models.ProductCreate,
    current_user: models.UserPublic = Depends(get_current_user)
):
    """
    Create a new product. Only admins can create products.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create products")

    product_dict = product.model_dump()
    result = db.products.insert_one(product_dict)

    created_product = db.products.find_one({"_id": result.inserted_id})
    created_product["id"] = str(created_product.pop("_id"))

    return models.ProductInDB(**created_product)

@router.put("/{product_id}", response_model=models.ProductInDB)
async def update_product(
    product_id: str,
    product_update: models.ProductUpdate,
    current_user: models.UserPublic = Depends(get_current_user)
):
    """
    Update a product. Only admins can update products.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update products")

    try:
        obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    existing_product = db.products.find_one({"_id": obj_id})
    if not existing_product:
        raise HTTPException(status_code=404, detail="Product not found")

    update_data = {k: v for k, v in product_update.model_dump().items() if v is not None}

    if update_data:
        db.products.update_one({"_id": obj_id}, {"$set": update_data})

    updated_product = db.products.find_one({"_id": obj_id})
    updated_product["id"] = str(updated_product.pop("_id"))

    return models.ProductInDB(**updated_product)

@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    current_user: models.UserPublic = Depends(get_current_user)
):
    """
    Delete a product. Only admins can delete products.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete products")

    try:
        obj_id = ObjectId(product_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid product ID")

    result = db.products.delete_one({"_id": obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return None
