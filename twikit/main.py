from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from twikit import Client
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from models.session_model import CookieItem, CookieWrapper, SessionModel
from pydantic import BaseModel
from fastapi import Body


load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise Exception("MONGODB_URI not set in environment")


mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client["twitter_sessions"]


app = FastAPI()
SESSIONS_DIR = "./sessions"
os.makedirs(SESSIONS_DIR, exist_ok=True)


@app.on_event("startup")
async def startup_event():
    try:
        # Try listing collections to verify connection
        await db.list_collection_names()
        print("✅ MongoDB connected successfully.")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

class LoginRequest(BaseModel):
    auth_info_1: str
    auth_info_2: str
    password: str



@app.post("/login")
async def login_user(body: LoginRequest):
    try:
        client = Client("en-US")
        cookie_path = f"{SESSIONS_DIR}/{body.auth_info_1}.json"

        await client.login(
            auth_info_1=body.auth_info_1,
            auth_info_2=body.auth_info_2,
            password=body.password,
            cookies_file=cookie_path
        )

        # Extract cookies and format
        structured_cookies = []
        for cookie in client.cookie_jar:
            structured_cookies.append({
                "domain": cookie["domain"],
                "name": cookie["name"],
                "value": cookie["value"],
                "path": cookie.get("path", "/"),
                "secure": cookie.get("secure", False),
                "httpOnly": cookie.get("httpOnly", False)
            })

        # Wrap cookies for the model
        wrapped_cookies = { "cookies": structured_cookies }

        # Save to MongoDB
        await db.sessions.update_one(
            {"auth_info_1": body.auth_info_1},
            {"$set": {
                "auth_info_1": body.auth_info_1,
                "auth_info_2": body.auth_info_2,
                "cookies": wrapped_cookies
            }},
            upsert=True
        )

        return {
            "message": "Login successful, cookies stored in DB.",
            "cookies": wrapped_cookies
        }

    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")



class CookieItem(BaseModel):
    domain: str
    name: str
    value: str
    path: str
    secure: bool
    httpOnly: bool

class CookieList(BaseModel):
    cookies: List[CookieItem]

def get_media_url(media) -> Optional[str]:
    """
    Get the best media URL from a twikit Media object.
    """
    try:
        if media.type == "photo":
            # For photos, return full_url directly
            return media.full_url
        elif media.type in ("video", "animated_gif"):
            video_info = media.video_info or {}
            variants = video_info.get("variants", [])
            if variants:
                # Pick variant with highest bitrate (best quality)
                variants = sorted(variants, key=lambda v: v.get("bitrate", 0), reverse=True)
                return variants[0].get("url")
    except Exception:
        # Fail silently and return None if any unexpected structure
        return None
    return None

@app.post("/get-feed")
async def get_feed(data: CookieList):
    try:
        client = Client("en-US")

        # Convert list of cookies to dict for twikit client
        cookie_dict = {c.name: c.value for c in data.cookies}
        client.set_cookies(cookie_dict)

        tweets = await client.get_timeline(count=10)

        result = []
        for tweet in tweets:
            media_urls = []
            if tweet.media:
                for m in tweet.media:
                    url = get_media_url(m)
                    if url:
                        media_urls.append(url)

            result.append({
                "author": tweet.user.name,
                "handle": tweet.user.screen_name,
                "text": tweet.text,
                "created_at": str(tweet.created_at),
                "likes": tweet.favorite_count,
                "retweets": tweet.retweet_count,
                "replies": tweet.reply_count,
                "media": media_urls
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")


class AuthMatchRequest(BaseModel):
    auth_info_1: str
    auth_info_2: str

@app.post("/match-sessions")
async def match_sessions(body: AuthMatchRequest = Body(...)):
    try:
        matches_cursor = db.sessions.find({
            "auth_info_1": body.auth_info_1,
            "auth_info_2": body.auth_info_2
        })

        matches = []
        async for doc in matches_cursor:
            matches.append({
                "auth_info_1": doc["auth_info_1"],
                "auth_info_2": doc["auth_info_2"],
                "cookies": doc.get("cookies", {})
            })

        return {"matches": matches}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))