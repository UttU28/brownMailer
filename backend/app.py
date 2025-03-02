from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

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

class CompanyRequest(BaseModel):
    companyName: str

@app.post("/getPeople")
async def getPeople(request: CompanyRequest):
    print(f"Fetching people from company: {request.companyName}")
    people = getPeopleFromCompany(request.companyName)
    # people = [{"fullName": "Rachel Carey","position": "Talent Acquisition Recruiter","company": "Entegris","linkedin": "https://www.linkedin.com/in/rachel-carey-2a13855b","emails": ["rachel_carey@entegris.com"]},{"fullName": "Jen Hoeptner","position": "Corporate Recruiter","company": "Entegris","linkedin": "https://www.linkedin.com/in/jenhoeptner","emails": ["jhoeptne@its.jnj.com","jen_hoeptner@entegris.com"]},{"fullName": "Taylor Ross Cromwell","position": "Recruiter","company": "Entegris","linkedin": "https://www.linkedin.com/in/taylor-ross-cromwell-9941418b","emails": ["taylor_ross@entegris.com","taylorwinifredross@gmail.com"]},{"fullName": "Tricia A. Pine","position": "Talent Acquisition Recruiter","company": "Entegris","linkedin": "https://www.linkedin.com/in/tricia-a-pine-3836344","emails": ["tricia_pine@entegris.com","tlaw524@aol.com","triciapine1@gmail.com"]},{"fullName": "John Lima","position": "","company": "Entegris","linkedin": "https://www.linkedin.com/in/john-lima-52682540","emails": ["john.lima@entegris.com"]},{"fullName": "Anjuli DiGiuseppe","position": "HR Business Partner","company": "Entegris","linkedin": "https://www.linkedin.com/in/anjuliganguly","emails": ["anjuli_ganguly@entegris.com","anjuli_ganguly@cabotcmp.com","asgee@sfsu.edu"]},{"fullName": "Brannon Gustafson","position": "","company": "Entegris","linkedin": "https://www.linkedin.com/in/brannon-gustafson-936092289","emails": ["brannon_gustafson@entegris.com"]},{"fullName": "David Darnold","position": "Sr Recruiter","company": "Entegris","linkedin": "https://www.linkedin.com/in/daviddarnold","emails": ["david_darnold@entegris.com","ddarnold923@gmail.com"]},{"fullName": "Bob Scanlon","position": "","company": "Entegris","linkedin": "https://www.linkedin.com/in/scanlonbob","emails": ["bob_scanlon@entegris.com","robert.scanlon@kellyengineering.com","bobkaw@gmail.com"]}]
    return JSONResponse(content={"count": len(people), "data": people})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=3000, reload=True)
