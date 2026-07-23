from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class NewsletterSignupRequest(BaseModel):
    email: str = Field(min_length=3, max_length=320)


class ReviewCreateRequest(BaseModel):
    productId: str = Field(min_length=1, max_length=200)
    rating: int = Field(ge=1, le=5)
    name: Optional[str] = Field(default=None, max_length=120)
    text: str = Field(min_length=3, max_length=2000)


class OrderStatusLookupResponse(BaseModel):
    found: bool = False
    order: Optional[dict[str, Any]] = None


class OrderCancelRequest(BaseModel):
    orderNumber: str = Field(min_length=3, max_length=60)
    reason: str = Field(min_length=3, max_length=500)
