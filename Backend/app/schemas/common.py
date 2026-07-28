"""
Shared building blocks used across multiple schemas.

Almost every user-facing piece of text in this store is bilingual —
product names, descriptions, tags, hero banner copy — always stored as
{"es": "...", "en": "..."} in JSON columns. `Localized` is that shape,
defined once here so every schema below reuses it instead of repeating
{es: str, en: str} in five different files.
"""

from pydantic import BaseModel, ConfigDict


class Localized(BaseModel):
    es: str
    en: str


def to_camel(snake_str: str) -> str:
    """
    Converts snake_case (how Postgres columns and Python fields are
    named — e.g. `address_line1`, `title_one`) into camelCase (how the
    frontend already writes it — e.g. `addressLine1`, `titleOne`).

    Used as an `alias_generator` in schemas so we can keep writing
    idiomatic snake_case Python everywhere internally, while the JSON
    that actually goes over the wire to Héctor's frontend matches what
    it already expects — no snake_case leaking into the API responses.
    """
    first, *rest = snake_str.split("_")
    return first + "".join(word.capitalize() for word in rest)


class CamelModel(BaseModel):
    """
    Base class for any schema whose JSON needs camelCase keys.

    - populate_by_name=True: lets us still build these objects in Python
      using the snake_case field names (e.g. Shipping(address_line1=...))
    - by defining alias_generator, .model_dump(by_alias=True) and
      .model_dump_json(by_alias=True) output camelCase keys automatically
    """

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)
