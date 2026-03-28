from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routes import planner, task

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Smart Study Planner API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(planner.router, prefix="/api/subjects", tags=["Subjects"])
app.include_router(task.router, prefix="/api/tasks", tags=["Tasks"])