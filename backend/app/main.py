from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from loguru import logger

from app.database import init_db
from app.routes.auth import router as auth_router
from app.routes.participants import router as participants_router
from app.seed import seed

app = FastAPI(
    title="Clinical Trial Dashboard API",
    description="API for managing clinical trial participants and metrics",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(participants_router)


@app.on_event("startup")
def on_startup() -> None:
    logger.info("Starting up — initializing database")
    init_db()
    seed()
    logger.info("Startup complete")


@app.get("/health")
def health_check():
    return {"status": "ok"}
