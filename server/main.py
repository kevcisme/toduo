from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
from pathlib import Path
import unicodedata
import re

app = FastAPI(title="Toduo FastAPI Backend")

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory data store
data_store: Dict[str, List] = {
    "tasks": [],
    "notes": [],
    "boards": [],
    "columns": [],
    "cards": [],
    "tags": [],
}

# File service functions
def slugify(text: str) -> str:
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^\w\s-]", "", text).lower()
    text = re.sub(r"[-\s]+", "-", text).strip("-_")
    return text

vault_dir = Path.home() / "toduo-vault"
vault_dir.mkdir(parents=True, exist_ok=True)

def save_new_note_file(title: str, content: str) -> str:
    filename = f"{slugify(title)}-{int(datetime.utcnow().timestamp())}.md"
    file_path = vault_dir / filename
    data = f"# {title}\n\n{content}"
    file_path.write_text(data, encoding="utf-8")
    return str(file_path)

def update_note_file(original_path: str, title: str, content: str) -> str:
    path = Path(original_path)
    if not path.exists():
        base = path.stem or slugify(title)
        filename = f"{base}-{int(datetime.utcnow().timestamp())}.md"
        path = vault_dir / filename
    data = f"# {title}\n\n{content}"
    path.write_text(data, encoding="utf-8")
    return str(path)

# Pydantic models
class Task(BaseModel):
    id: int
    title: str
    description: Optional[str] = ""
    completed: bool = False
    created_at: datetime
    updated_at: datetime

class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None

class Note(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime

class NoteCreate(BaseModel):
    title: str
    content: str

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None

class Board(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

class BoardCreate(BaseModel):
    title: str

class BoardUpdate(BaseModel):
    title: Optional[str] = None

class Column(BaseModel):
    id: int
    board_id: int
    title: str
    position: int
    created_at: datetime

class ColumnCreate(BaseModel):
    title: str
    position: int

class ColumnUpdate(BaseModel):
    title: Optional[str] = None
    position: Optional[int] = None

class Card(BaseModel):
    id: int
    column_id: int
    title: str
    description: str
    position: int
    created_at: datetime
    updated_at: datetime

class CardCreate(BaseModel):
    title: str
    description: str = ""
    position: Optional[int] = 0

class CardUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    position: Optional[int] = None

class Tag(BaseModel):
    id: int
    name: str
    color: str
    created_at: datetime

class TagCreate(BaseModel):
    name: str
    color: str

# Helper to get next id
def get_next_id(items: List[BaseModel]) -> int:
    return max((item.id for item in items), default=0) + 1

# Root endpoint
@app.get("/", tags=["root"])
def root():
    return {"message": "Server is running"}

# Task endpoints
@app.get("/api/tasks", response_model=List[Task], tags=["tasks"])
def get_tasks():
    return data_store["tasks"]

@app.post("/api/tasks", tags=["tasks"])
def create_task(task: TaskCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["tasks"])
    obj = Task(
        id=new_id,
        title=task.title,
        description=task.description or "",
        completed=False,
        created_at=now,
        updated_at=now,
    )
    data_store["tasks"].append(obj)
    return {"lastInsertRowid": new_id}

@app.get("/api/tasks/{task_id}", response_model=Task, tags=["tasks"])
def get_task(task_id: int):
    for t in data_store["tasks"]:
        if t.id == task_id:
            return t
    raise HTTPException(status_code=404, detail="Task not found")

@app.put("/api/tasks/{task_id}", tags=["tasks"])
def update_task(task_id: int, task: TaskUpdate):
    for idx, t in enumerate(data_store["tasks"]):
        if t.id == task_id:
            data = t.dict()
            updates = task.dict(exclude_unset=True)
            data.update(updates)
            data["updated_at"] = datetime.utcnow()
            data_store["tasks"][idx] = Task(**data)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Task not found")

@app.delete("/api/tasks/{task_id}", tags=["tasks"])
def delete_task(task_id: int):
    for idx, t in enumerate(data_store["tasks"]):
        if t.id == task_id:
            data_store["tasks"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Task not found")

# Note endpoints
@app.get("/api/notes", response_model=List[Note], tags=["notes"])
def get_notes():
    return data_store["notes"]

@app.post("/api/notes", tags=["notes"])
def create_note(note: NoteCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["notes"])
    obj = Note(
        id=new_id,
        title=note.title,
        content=note.content,
        created_at=now,
        updated_at=now,
    )
    data_store["notes"].append(obj)
    return {"lastInsertRowid": new_id}

@app.get("/api/notes/{note_id}", response_model=Note, tags=["notes"])
def get_note(note_id: int):
    for n in data_store["notes"]:
        if n.id == note_id:
            return n
    raise HTTPException(status_code=404, detail="Note not found")

@app.put("/api/notes/{note_id}", tags=["notes"])
def update_note(note_id: int, note: NoteUpdate):
    for idx, n in enumerate(data_store["notes"]):
        if n.id == note_id:
            data = n.dict()
            updates = note.dict(exclude_unset=True)
            data.update(updates)
            data["updated_at"] = datetime.utcnow()
            data_store["notes"][idx] = Note(**data)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Note not found")

@app.delete("/api/notes/{note_id}", tags=["notes"])
def delete_note(note_id: int):
    for idx, n in enumerate(data_store["notes"]):
        if n.id == note_id:
            data_store["notes"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Note not found")

# Board endpoints
@app.get("/api/boards", response_model=List[Board], tags=["boards"])
def get_boards():
    return data_store["boards"]

@app.post("/api/boards", tags=["boards"])
def create_board(board: BoardCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["boards"])
    obj = Board(id=new_id, title=board.title, created_at=now, updated_at=now)
    data_store["boards"].append(obj)
    return {"lastInsertRowid": new_id}

@app.get("/api/boards/{board_id}", response_model=Board, tags=["boards"])
def get_board(board_id: int):
    for b in data_store["boards"]:
        if b.id == board_id:
            return b
    raise HTTPException(status_code=404, detail="Board not found")

@app.put("/api/boards/{board_id}", tags=["boards"])
def update_board(board_id: int, board: BoardUpdate):
    for idx, b in enumerate(data_store["boards"]):
        if b.id == board_id:
            data = b.dict()
            updates = board.dict(exclude_unset=True)
            data.update(updates)
            data["updated_at"] = datetime.utcnow()
            data_store["boards"][idx] = Board(**data)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Board not found")

@app.delete("/api/boards/{board_id}", tags=["boards"])
def delete_board(board_id: int):
    for idx, b in enumerate(data_store["boards"]):
        if b.id == board_id:
            data_store["boards"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Board not found")

# Column endpoints
@app.get("/api/boards/{board_id}/columns", response_model=List[Column], tags=["columns"])
def get_columns(board_id: int):
    return [c for c in data_store["columns"] if c.board_id == board_id]

@app.post("/api/boards/{board_id}/columns", tags=["columns"])
def create_column(board_id: int, column: ColumnCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["columns"])
    obj = Column(id=new_id, board_id=board_id, title=column.title, position=column.position, created_at=now)
    data_store["columns"].append(obj)
    return {"lastInsertRowid": new_id}

@app.put("/api/boards/columns/{column_id}", tags=["columns"])
def update_column(column_id: int, column: ColumnUpdate):
    for idx, c in enumerate(data_store["columns"]):
        if c.id == column_id:
            data = c.dict()
            updates = column.dict(exclude_unset=True)
            data.update(updates)
            data_store["columns"][idx] = Column(**data)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Column not found")

@app.delete("/api/boards/columns/{column_id}", tags=["columns"])
def delete_column(column_id: int):
    for idx, c in enumerate(data_store["columns"]):
        if c.id == column_id:
            data_store["columns"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Column not found")

# Card endpoints
@app.get("/api/boards/columns/{column_id}/cards", response_model=List[Card], tags=["cards"])
def get_cards(column_id: int):
    return [c for c in data_store["cards"] if c.column_id == column_id]

@app.post("/api/boards/columns/{column_id}/cards", tags=["cards"])
def create_card(column_id: int, card: CardCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["cards"])
    obj = Card(id=new_id, column_id=column_id, title=card.title, description=card.description, position=card.position or 0, created_at=now, updated_at=now)
    data_store["cards"].append(obj)
    return {"lastInsertRowid": new_id}

@app.put("/api/boards/cards/{card_id}", tags=["cards"])
def update_card(card_id: int, card: CardUpdate):
    for idx, c in enumerate(data_store["cards"]):
        if c.id == card_id:
            data = c.dict()
            updates = card.dict(exclude_unset=True)
            data.update(updates)
            data["updated_at"] = datetime.utcnow()
            data_store["cards"][idx] = Card(**data)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Card not found")

@app.delete("/api/boards/cards/{card_id}", tags=["cards"])
def delete_card(card_id: int):
    for idx, c in enumerate(data_store["cards"]):
        if c.id == card_id:
            data_store["cards"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Card not found")

# Tag endpoints
@app.get("/api/tags", response_model=List[Tag], tags=["tags"])
def get_tags():
    return data_store["tags"]

@app.post("/api/tags", tags=["tags"])
def create_tag(tag: TagCreate):
    now = datetime.utcnow()
    new_id = get_next_id(data_store["tags"])
    obj = Tag(id=new_id, name=tag.name, color=tag.color, created_at=now)
    data_store["tags"].append(obj)
    return {"lastInsertRowid": new_id}

@app.get("/api/tags/{tag_id}", response_model=Tag, tags=["tags"])
def get_tag(tag_id: int):
    for t in data_store["tags"]:
        if t.id == tag_id:
            return t
    raise HTTPException(status_code=404, detail="Tag not found")

@app.delete("/api/tags/{tag_id}", tags=["tags"])
def delete_tag(tag_id: int):
    for idx, t in enumerate(data_store["tags"]):
        if t.id == tag_id:
            data_store["tags"].pop(idx)
            return {"changes": 1}
    raise HTTPException(status_code=404, detail="Tag not found")

# Vault endpoints
class VaultResult(BaseModel):
    filePath: str

@app.post("/api/vault/save", response_model=VaultResult, tags=["vault"])
def vault_save(title: str = Body(...), content: str = Body(...)):
    path = save_new_note_file(title, content)
    return VaultResult(filePath=path)

@app.put("/api/vault/update", response_model=VaultResult, tags=["vault"])
def vault_update(filePath: str = Body(...), title: str = Body(...), content: str = Body(...)):
    new_path = update_note_file(filePath, title, content)
    return VaultResult(filePath=new_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=3000, reload=True) 