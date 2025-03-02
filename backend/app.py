from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
from datetime import datetime

from utils.aaPeopleFromCompany import getPeopleFromCompany
from utils.abDraftingEmail import createDraft

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:3000",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache file path
CACHE_FILE = "data/company_cache.json"

# Initialize cache file if it doesn't exist
if not os.path.exists(CACHE_FILE):
    with open(CACHE_FILE, 'w') as f:
        json.dump({}, f)

def load_cache():
    try:
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_cache(cache_data):
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache_data, f, indent=2)

class CompanyRequest(BaseModel):
    companyName: str
    position: Optional[str] = None
    jobId: Optional[str] = None

class EmailRequest(BaseModel):
    email: str

@app.post("/getPeople")
async def getPeople(request: CompanyRequest):
    print(f"Fetching people from company: {request.companyName}")
    if request.position:
        print(f"Position: {request.position}")
    if request.jobId:
        print(f"Job ID: {request.jobId}")
    
    print(request.companyName, request.position, request.jobId)

    # Check cache first
    cache = load_cache()
    if request.companyName in cache:
        print(f"Cache hit for company: {request.companyName}")
        people = cache[request.companyName]["data"]
    else:
        print(f"Cache miss for company: {request.companyName}")
        # Fetch new data
        people = getPeopleFromCompany(request.companyName)
        # Store in cache with timestamp
        cache[request.companyName] = {
            "data": people,
            "timestamp": datetime.now().isoformat()
        }
        save_cache(cache)

    return JSONResponse(content={
        "count": len(people), 
        "data": people,
        "metadata": {
            "company": request.companyName,
            "position": request.position,
            "jobId": request.jobId,
            "cached": request.companyName in cache
        }
    })

@app.post("/sendEmail")
async def sendEmail(request: EmailRequest):
    try:
        print(f"Adding email to queue: {request.email}")
        # Here you would typically call your email drafting function
        # createDraft(request.email)
        return JSONResponse(content={
            "status": "success",
            "message": "Email added to queue",
            "email": request.email
        })
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={
                "status": "error",
                "message": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=3000, reload=True)
