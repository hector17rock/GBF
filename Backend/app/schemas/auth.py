from pydantic import BaseModel, Field


class BootstrapAdminRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    username: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=1, max_length=200)
    bootstrap_token: str | None = None


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=60)
    password: str = Field(min_length=1, max_length=200)


class AdminUserPublic(BaseModel):
    id: str
    username: str
    name: str


class AuthResponse(BaseModel):
    token: str
    user: AdminUserPublic


class HasAdminsResponse(BaseModel):
    hasAdmins: bool
