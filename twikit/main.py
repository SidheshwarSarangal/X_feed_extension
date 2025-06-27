from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from twikit import Client
import os
import pickle

app = FastAPI()
SESSIONS_DIR = "./sessions"
os.makedirs(SESSIONS_DIR, exist_ok=True)

class LoginRequest(BaseModel):
    username: str
    password: str

@app.post("/login")
def login_user(body: LoginRequest):
    try:
        client = Client()
        client.login(body.username, body.password)

        with open(f"{SESSIONS_DIR}/{body.username}.pkl", "wb") as f:
            pickle.dump(client, f)

        return {"message": "Login successful and session saved."}
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Login failed: {str(e)}")

@app.get("/get-feed")
def get_feed(username: str = Query(...)):
    try:
        session_path = f"{SESSIONS_DIR}/{username}.pkl"
        if not os.path.exists(session_path):
            raise HTTPException(status_code=404, detail="Session not found")

        with open(session_path, "rb") as f:
            client = pickle.load(f)

        home_tweets = client.get_home_timeline(limit=10)
        return [{"text": t.text, "created_at": str(t.created_at)} for t in home_tweets]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch feed: {str(e)}")
