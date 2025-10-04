from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient


MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017/eventsdb")

app = FastAPI(title="Event Builder API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class Page(BaseModel):
    id: str
    title: str = ""
    coverUrl: str = ""
    backgroundUrl: str = ""
    html: str = ""
    previewTitle: str = ""
    previewDescription: str = ""


class Event(BaseModel):
    id: Optional[str] = None
    title: str = ""
    pages: List[Page] = []
    styles: str = ""
    images: List[str] = []
    updatedAt: Optional[int] = None


client: AsyncIOMotorClient | None = None


@app.on_event("startup")
async def on_startup():
    global client
    client = AsyncIOMotorClient(MONGODB_URL)
    # Ensure indexes
    await client.get_default_database()["events"].create_index("id", unique=True)


@app.on_event("shutdown")
async def on_shutdown():
    if client is not None:
        client.close()


def events_collection():
    assert client is not None
    return client.get_default_database()["events"]


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/api/events")
async def list_events():
    cursor = events_collection().find({}, {"_id": 0}).sort("updatedAt", -1)
    return [doc async for doc in cursor]


@app.post("/api/events")
async def upsert_event(ev: Event):
    if not ev.id:
        raise HTTPException(status_code=400, detail="id is required")
    await events_collection().update_one({"id": ev.id}, {"$set": ev.model_dump()}, upsert=True)
    doc = await events_collection().find_one({"id": ev.id}, {"_id": 0})
    return doc


@app.get("/api/events/{event_id}")
async def get_event(event_id: str):
    doc = await events_collection().find_one({"id": event_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404)
    return doc


@app.delete("/api/events/{event_id}")
async def delete_event(event_id: str):
    await events_collection().delete_one({"id": event_id})
    return {"deleted": True}


# Simple file storage
UPLOAD_DIR = Path("/data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.post("/api/uploads")
async def upload_image(file: UploadFile = File(...)):
    suffix = Path(file.filename).suffix or ".bin"
    name = f"{os.urandom(8).hex()}{suffix}"
    dest = UPLOAD_DIR / name
    contents = await file.read()
    dest.write_bytes(contents)
    return {"url": f"/api/uploads/{name}"}


@app.get("/api/uploads/{name}")
async def get_upload(name: str):
    dest = UPLOAD_DIR / name
    if not dest.exists():
        raise HTTPException(status_code=404)
    return FileResponse(dest)


