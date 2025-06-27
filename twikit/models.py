from pydantic import BaseModel

class CookieItem(BaseModel):
    domain: str
    name: str
    value: str
    path: str
    secure: bool
    httpOnly: bool
