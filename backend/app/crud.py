from sqlalchemy.orm import Session
from . import models, schemas

def get_subjects_by_email(db: Session, email: str):
    return db.query(models.Subject).filter(models.Subject.user_email == email).all()

def create_subject(db: Session, subject: schemas.SubjectCreate, total_hrs: float, theory_hrs: float, practice_hrs: float):
    db_subject = models.Subject(
        user_email=subject.user_email,
        name=subject.name,
        days=subject.days,
        difficulty=subject.difficulty,
        total_hours=total_hrs,
        theory_hours=theory_hrs,
        practice_hours=practice_hrs
    )
    db.add(db_subject)
    db.commit()
    db.refresh(db_subject)
    return db_subject

def delete_subject(db: Session, subject_id: int):
    db_subject = db.query(models.Subject).filter(models.Subject.id == subject_id).first()
    if db_subject:
        db.delete(db_subject)
        db.commit()
    return db_subject

def get_tasks_by_email(db: Session, email: str):
    return db.query(models.Task).filter(models.Task.user_email == email).all()

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(user_email=task.user_email, name=task.name, completed=False)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task