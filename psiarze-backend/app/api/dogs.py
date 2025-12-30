from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import Dog, User
from app.schemas.dogs import DogCreate, DogPublic, DogUpdate
from app.services.deps import get_current_user

router = APIRouter(prefix="/dogs", tags=["dogs"])


@router.get("/mine", response_model=list[DogPublic])
def list_my_dogs(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dogs = db.execute(select(Dog).where(Dog.owner_id == user.id).order_by(Dog.created_at.desc())).scalars().all()
    return [DogPublic(id=d.id, owner_id=d.owner_id, name=d.name, breed=d.breed, age=d.age, weight=d.weight, created_at=d.created_at) for d in dogs]


@router.post("/mine", response_model=DogPublic)
def create_my_dog(payload: DogCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dog = Dog(owner_id=user.id, name=payload.name, breed=payload.breed, age=payload.age, weight=payload.weight)
    db.add(dog)
    db.commit()
    db.refresh(dog)
    return DogPublic(id=dog.id, owner_id=dog.owner_id, name=dog.name, breed=dog.breed, age=dog.age, weight=dog.weight, created_at=dog.created_at)


@router.put("/mine/{dog_id}", response_model=DogPublic)
def update_my_dog(dog_id: str, payload: DogUpdate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dog = db.get(Dog, dog_id)
    if not dog or dog.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono psa")
    
    if payload.name is not None:
        dog.name = payload.name
    if payload.breed is not None:
        dog.breed = payload.breed
    if payload.age is not None:
        dog.age = payload.age
    if payload.weight is not None:
        dog.weight = payload.weight
    
    db.commit()
    db.refresh(dog)
    return DogPublic(id=dog.id, owner_id=dog.owner_id, name=dog.name, breed=dog.breed, age=dog.age, weight=dog.weight, created_at=dog.created_at)


@router.delete("/mine/{dog_id}")
def delete_my_dog(dog_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    dog = db.get(Dog, dog_id)
    if not dog or dog.owner_id != user.id:
        raise HTTPException(status_code=404, detail="Nie znaleziono psa")
    db.delete(dog)
    db.commit()
    return {"ok": True}
