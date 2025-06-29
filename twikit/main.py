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
import json
import httpx


from fastapi.middleware.cors import CORSMiddleware



load_dotenv()


MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise Exception("MONGODB_URI not set in environment")


mongo_client = AsyncIOMotorClient(MONGODB_URI)
db = mongo_client["twitter_sessions"]


app = FastAPI()
SESSIONS_DIR = "./sessions"
os.makedirs(SESSIONS_DIR, exist_ok=True)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)


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


"""
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

"""


import os

@app.post("/login")
async def login_user(body: LoginRequest):
    client = Client("en-US")
    cookie_path = f"{SESSIONS_DIR}/{body.auth_info_1}.json"

    try:
        # Perform login
        await client.login(
            auth_info_1=body.auth_info_1,
            auth_info_2=body.auth_info_2,
            password=body.password,
            cookies_file=cookie_path
        )

        # Extract and structure cookies
        structured_cookies = []
        for cookie in client.get_cookies():
            structured_cookies.append({
                "domain": cookie["domain"],
                "name": cookie["name"],
                "value": cookie["value"],
                "path": cookie.get("path", "/"),
                "secure": cookie.get("secure", False),
                "httpOnly": cookie.get("httpOnly", False)
            })

        wrapped_cookies = {"cookies": structured_cookies}

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

    finally:
        # ✅ Delete session file if it exists
        if os.path.exists(cookie_path):
            try:
                os.remove(cookie_path)
                print(f"🧹 Deleted session file: {cookie_path}")
            except Exception as cleanup_error:
                print(f"⚠️ Failed to delete session file: {cleanup_error}")


@app.post("/login-from-file/{username}")
async def login_from_file(username: str):
    try:
        cookie_path = f"./{username}"
        

        if not os.path.exists(cookie_path):
            print("xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
            raise HTTPException(status_code=404, detail="Cookie file not found.")

        with open(cookie_path, "r", encoding="utf-8") as f:
            raw_cookies = json.load(f)

        # If the file is a raw cookie dict like: {"name": "value", ...}
        if isinstance(raw_cookies, dict) and "cookies" not in raw_cookies:
            structured_cookies = [
                {
                    "domain": ".twitter.com",
                    "name": name,
                    "value": value,
                    "path": "/",
                    "secure": False,
                    "httpOnly": False
                }
                for name, value in raw_cookies.items()
            ]
        # If it's already structured (like {"cookies": [...]})
        elif "cookies" in raw_cookies:
            structured_cookies = raw_cookies["cookies"]
        else:
            raise HTTPException(status_code=400, detail="Invalid cookie file format.")

        wrapped_cookies = {"cookies": structured_cookies}

        # Insert into DB
        await db.sessions.update_one(
            {"auth_info_1": username},
            {"$set": {
                "auth_info_1": username,
                "auth_info_2": "",  # optional, leave blank or load if stored
                "cookies": wrapped_cookies
            }},
            upsert=True
        )

        return {
            "message": f"Cookies from file for '{username}' stored in DB.",
            "cookies": wrapped_cookies
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read or insert: {str(e)}")


class CookieItem(BaseModel):
    name: str
    value: str

class CookieList(BaseModel):
    cookies: List[CookieItem]

def is_full_media_url(url: str) -> bool:
    # Allow only full-size media files (no thumbnails)
    if not url:
        return False
    url = url.lower()

    # Only keep common media types (no *_thumb or profile_*_bigger.jpg etc.)
    if "thumb" in url or "profile_images" in url or "bigger" in url:
        return False

    return url.endswith((
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".mp4", ".mov"
    ))

def extract_valid_media(media_items):
    media_urls = []
    try:
        for item in media_items:
            if hasattr(item, "media_url_https"):
                url = item.media_url_https
                if is_full_media_url(url):
                    media_urls.append(url)
            elif hasattr(item, "media_url"):
                url = item.media_url
                if is_full_media_url(url):
                    media_urls.append(url)
    except Exception as e:
        print("⚠️ Error in extract_valid_media:", e)
    return media_urls

@app.post("/get-feed")
async def get_feed(data: CookieList):
    try:
        client = Client("en-US")
        cookie_dict = {c.name: c.value for c in data.cookies}
        client.set_cookies(cookie_dict)

        tweets = await client.get_timeline(count=20)
        result = []

        for tweet in tweets:
            media_urls = []

            # Check main + retweet + quoted
            sources = [tweet]
            if hasattr(tweet, "retweeted_status"):
                sources.append(tweet.retweeted_status)
            if hasattr(tweet, "quoted_status"):
                sources.append(tweet.quoted_status)

            for src in sources:
                if hasattr(src, "media") and src.media:
                    media_urls.extend(extract_valid_media(src.media))

            result.append({
                "author": tweet.user.name,
                "handle": tweet.user.screen_name,
                "text": tweet.text,
                "created_at": str(tweet.created_at),
                "likes": tweet.favorite_count,
                "retweets": tweet.retweet_count,
                "replies": tweet.reply_count,
                "media": media_urls,
            })

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")

@app.get("/proxy-image")
async def proxy_image(url: str):
    try:
        async with httpx.AsyncClient() as client:
            headers = {
                "Referer": "https://x.com",
                "User-Agent": "Mozilla/5.0"
            }
            response = await client.get(url, headers=headers)
            return StreamingResponse(
                response.aiter_bytes(),
                media_type=response.headers.get("Content-Type", "image/jpeg")
            )
    except Exception as e:
        print("❌ Proxy image error:", e)
        raise HTTPException(status_code=500, detail="Image proxy failed")

class AuthMatchRequest(BaseModel):
    auth_info_1: str
    auth_info_2: str

@app.post("/match-sessions")
async def match_sessions(body: AuthMatchRequest = Body(...)):
    try:
        matches_cursor = db.sessions.find({
            "$or": [
                {"auth_info_1": body.auth_info_1},
                {"auth_info_2": body.auth_info_2}
            ]
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


