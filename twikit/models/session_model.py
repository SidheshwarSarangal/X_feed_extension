from pydantic import BaseModel
from typing import List


class CookieItem(BaseModel):
    domain: str
    name: str
    value: str
    path: str = "/"
    secure: bool = True
    httpOnly: bool = False


class CookieWrapper(BaseModel):
    cookies: List[CookieItem]


class SessionModel(BaseModel):
    auth_info_1: str
    auth_info_2: str
    cookies: CookieWrapper
