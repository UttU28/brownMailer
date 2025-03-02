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
    # print(people)
    return JSONResponse(content={"count": len(people), "data": people})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=3000)
