from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
from datetime import datetime
from colorama import Fore, Style
from bs4 import BeautifulSoup
from utils.aaPeopleFromCompany import getPeopleFromCompany
from utils.abDraftingEmail import createDraft
from utils.prompts import HLTS_SYSTEM_PROMPT, HLTS_USER_PROMPT, VRFY_SYSTEM_PROMPT, VRFY_USER_PROMPT
from utils.llms import callOllama

app = FastAPI()

# Configure CORS
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

class EmailRequest(BaseModel):
    recipientEmail: str
    recipientName: str
    position: Optional[str] = None           # Position we're applying to
    companyName: Optional[str] = None
    jobId: Optional[str] = None
    jobDescriptionHtml: Optional[str] = None

@app.post("/getPeople")
async def getPeople(request: CompanyRequest):
    print(f"Fetching people from company: {request}")
    
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
            "cached": request.companyName in cache
        }
    })

@app.post("/sendEmail")
async def sendEmail(request: EmailRequest):
    try:
        print(f"{Fore.CYAN}Adding email to queue for {request.recipientName}: {request.recipientEmail}{Style.RESET_ALL}")
        print(f"{Fore.CYAN}Job Position: {request.position}{Style.RESET_ALL}")
        
        jobDescription = None
        hasJobDescription = False
        
        # Try to extract job description if HTML is provided
        if request.jobDescriptionHtml:
            try:
                soup = BeautifulSoup(request.jobDescriptionHtml, 'html.parser')
                jobDescription = '\n'.join(line.strip() for line in soup.get_text().splitlines() if line.strip())
                if jobDescription:
                    hasJobDescription = True
                    print(f"{Fore.GREEN}Successfully extracted job description ({len(jobDescription)} chars){Style.RESET_ALL}")
            except Exception as e:
                print(f"{Fore.YELLOW}Error parsing job description HTML: {str(e)}{Style.RESET_ALL}")
        
        jobCompany = request.companyName

        # Generate fallback job description if none is provided
        if not hasJobDescription:
            print(f"{Fore.YELLOW}No job description provided, using fallback{Style.RESET_ALL}")
            fallbackDescription = f"""
            Job Position: {request.position or 'Not specified'}
            Company: {jobCompany or 'Not specified'}
            """
            jobDescription = fallbackDescription
        
        # Process with LLM models if we have a job description
        highlightSkills = callOllama(HLTS_SYSTEM_PROMPT, HLTS_USER_PROMPT.format(jobDescription=jobDescription))
        verifiedSkills = callOllama(VRFY_SYSTEM_PROMPT, VRFY_USER_PROMPT.format(jobDescription=jobDescription, highlightSkills=highlightSkills))

        # Pass individual parameters to createDraft
        createDraft(
            request.recipientEmail, 
            request.recipientName, 
            jobCompany, 
            request.position,  # Job position we're applying to
            verifiedSkills
        )
        
        return JSONResponse(content={
            "status": "success",
            "message": "Email added to queue",
            "email": request.recipientEmail,
            "name": request.recipientName,
            "metadata": {
                "company": jobCompany,
                "jobPosition": request.position,
                "jobId": request.jobId,
                "hasJobDescription": hasJobDescription
            }
        })
    except Exception as e:
        print(f"{Fore.RED}Error sending email: {str(e)}{Style.RESET_ALL}")
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
