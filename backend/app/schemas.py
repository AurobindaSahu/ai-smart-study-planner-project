from pydantic import BaseModel, ConfigDict

# Subject Schemas
class SubjectCreate(BaseModel):
    user_email: str
    name: str
    days: int
    difficulty: int

class SubjectResponse(BaseModel):
    id: int
    user_email: str
    name: str
    days: int
    difficulty: int
    total_hours: float
    theory_hours: float
    practice_hours: float

    # ADDED: Updated for Pydantic V2
    model_config = ConfigDict(from_attributes=True)

# Task Schemas
class TaskCreate(BaseModel):
    user_email: str
    name: str

class TaskResponse(BaseModel):
    id: int
    user_email: str
    name: str
    completed: bool

    # ADDED: Updated for Pydantic V2
    model_config = ConfigDict(from_attributes=True)