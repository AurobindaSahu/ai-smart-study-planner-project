from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter()

@router.get("/", response_model=List[schemas.TaskResponse])
def get_tasks(email: str, db: Session = Depends(database.get_db)):
    return crud.get_tasks_by_email(db, email)

@router.post("/", response_model=schemas.TaskResponse)
def add_task(task: schemas.TaskCreate, db: Session = Depends(database.get_db)):
    return crud.create_task(db, task)