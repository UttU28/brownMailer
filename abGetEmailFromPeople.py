import os
import json
import requests
from dotenv import load_dotenv

load_dotenv()

salesqlApiKey = os.getenv("SALESQL_API_KEY")

if not salesqlApiKey:
    raise Exception("Missing SALESQL_API_KEY in the environment variables.")

def getEmailFromSalesQL(linkedinUrl, apiKey):
    url = f"https://api-public.salesql.com/v1/persons/enrich?linkedin_url={linkedinUrl}&api_key={apiKey}"
    response = requests.get(url)
    response.raise_for_status()
    return response.json()

def prioritizeEmails(emails):
    if not emails:
        return []
    
    workValid = [e["email"] for e in emails if e["type"] == "Work" and e["status"] == "Valid"]
    workUnverifiable = [e["email"] for e in emails if e["type"] == "Work" and e["status"] == "Unverifiable"]
    personalEmails = [e["email"] for e in emails if e["type"] == "Direct"]
    
    return workValid + workUnverifiable + personalEmails

def main():
    with open("search_results.json", "r") as json_file:
        data = json.load(json_file)
    
    if not data or not isinstance(data, list):
        raise ValueError("Invalid or empty JSON data in search_results.json")
    
    for person in data:
        linkedinUrl = person.get("linkedin", "")
        if linkedinUrl:
            emailData = getEmailFromSalesQL(linkedinUrl, salesqlApiKey)
            prioritizedEmails = prioritizeEmails(emailData.get("emails", []))
            
            person["emails"] = prioritizedEmails
    
    with open("search_results.json", "w") as output_file:
        json.dump(data, output_file, indent=4)
    
    print("Emails fetched and appended to search_results.json")

if __name__ == "__main__":
    main()