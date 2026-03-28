from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database
from ..ml_model.predict import get_study_prediction

router = APIRouter()

@router.post("/predict", response_model=schemas.SubjectResponse)
def predict_and_add_subject(subject: schemas.SubjectCreate, db: Session = Depends(database.get_db)):
    # 1. Get AI Prediction
    total, theory, practice = get_study_prediction(subject.days, subject.difficulty)
    
    # 2. Save to Database
    db_subject = crud.create_subject(db, subject, total, theory, practice)
    return db_subject

@router.get("/", response_model=List[schemas.SubjectResponse])
def read_subjects(email: str, db: Session = Depends(database.get_db)):
    return crud.get_subjects_by_email(db, email)

@router.delete("/{subject_id}")
def delete_subject(subject_id: int, db: Session = Depends(database.get_db)):
    crud.delete_subject(db, subject_id)
    return {"message": "Deleted successfully"}