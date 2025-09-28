from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, quizzes, files
from app.api import results
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(users.router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(quizzes.router, prefix=f"{settings.API_V1_STR}/quizzes", tags=["quizzes"])
app.include_router(files.router, prefix=f"{settings.API_V1_STR}/files", tags=["files"])
app.include_router(results.router, prefix=f"{settings.API_V1_STR}/results", tags=["results"])

@app.get("/")
def read_root():
    return {"message": "PDF Quiz Platform API", "version": "1.0.0"}

