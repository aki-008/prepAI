from fastapi import APIRouter
from app.api.v1.endpoints import auth, quiz, notes, vapi_ai

api_router = APIRouter()

# Include authentication routes
api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)


# Include quiz routes
api_router.include_router(
    quiz.router,
    prefix="/quiz",
    tags=["quiz"]
)

api_router.include_router(
    notes.router,
    prefix="/notes",
    tags=["notes"]
)

api_router.include_router(
    vapi_ai.router,
    prefix="/vapi",
    tags=["Voice AI"]
)