from fastapi import APIRouter, Depends

from models.user import User
from schemas.external import ExternalUsersResponse
from services import external_service
from utils.dependencies import get_current_user

router = APIRouter(prefix="/external", tags=["external"])


@router.get("/users", response_model=ExternalUsersResponse)
def get_external_users(current_user: User = Depends(get_current_user)):
    """Proxy to a public directory API with timeout, error handling and caching."""
    return external_service.fetch_users()
