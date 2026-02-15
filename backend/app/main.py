from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import ai, applications, auth, jobs
from app.config import settings

app = FastAPI(
    title="AITB Automation Job Board",
    description="API for connecting sponsors with apprentices for automation tasks",
    version="0.1.0",
)

# CORS middleware - allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative port
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(applications.router, prefix="/api")
app.include_router(ai.router, prefix="/api")


@app.get("/")
def root():
    return {
        "message": "AITB Automation Job Board API",
        "docs": "/docs",
        "version": "0.1.0",
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
