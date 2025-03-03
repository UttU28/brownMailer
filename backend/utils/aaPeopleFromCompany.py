import os
import json
import requests
from dotenv import load_dotenv
import re
try: 
    from utils.prompts import MKD_SYSTEM_PROMPT, MKD_COMPACT_PROMPT, EML_SYSTEM_PROMPT, EML_USER_PROMPT
    from utils.llms import callOllama
except: 
    from prompts import MKD_SYSTEM_PROMPT, MKD_COMPACT_PROMPT, EML_SYSTEM_PROMPT, EML_USER_PROMPT
    from llms import callOllama
import time
from colorama import Fore, Style
from tqdm import tqdm

# Load environment variables from .env file
load_dotenv()

googleApiKey = os.getenv("GOOGLE_API_KEY")
googleCseId = os.getenv("GOOGLE_CSE_ID")
salesqlApiKey = os.getenv("SALESQL_API_KEY")

if not googleApiKey or not googleCseId or not salesqlApiKey:
    raise Exception("Missing API keys in the environment variables.")

def googleSearch(query, apiKey, cseId):
    try:
        print(Fore.BLUE + "Performing Google Search..." + Style.RESET_ALL)
        url = "https://www.googleapis.com/customsearch/v1"
        params = {"key": apiKey, "cx": cseId, "q": query}
        response = requests.get(url, params=params)
        response.raise_for_status()
        print(Fore.GREEN + "✔ Google Search completed successfully!" + Style.RESET_ALL)
        return response.json()
    except requests.exceptions.RequestException as e:
        print(Fore.RED + f"✘ Error during Google Search: {e}" + Style.RESET_ALL)
        return {}

def cleanResults(rawResults):
    print(Fore.BLUE + "Cleaning search results..." + Style.RESET_ALL)
    cleaned = [{
        "title": item.get("title", ""),
        "snippet": item.get("snippet", "").replace('\u2026', '').strip(),
        "formattedUrl": item.get("formattedUrl", "")
    } for item in rawResults.get("items", [])]
    print(Fore.GREEN + "✔ Search results cleaned successfully!" + Style.RESET_ALL)
    return cleaned

def convertToMarkdown(cleanedResults):
    print(Fore.BLUE + "Converting results to Markdown format..." + Style.RESET_ALL)
    markdown = "# Search Results\n\n" + "\n\n".join([
        f"## {result['title']}\n\n**Snippet:** {result['snippet']}\n\n[Link]({result['formattedUrl']})\n\n---"
        for result in cleanedResults
    ])
    print(Fore.GREEN + "✔ Markdown conversion completed!" + Style.RESET_ALL)
    return markdown

def extractDataFromMarkdown(markdownText):
    try:
        print(Fore.BLUE + "Extracting data from Markdown..." + Style.RESET_ALL)
        start_time = time.time()
        rawContent = callOllama(MKD_SYSTEM_PROMPT, MKD_COMPACT_PROMPT.format(markdownText=markdownText))
        match = re.search(r'```json\n(.*?)\n```', rawContent, re.DOTALL) or re.search(r'```\n(.*?)\n```', rawContent, re.DOTALL) or re.search(r'\[\s*\{.*\}\s*\]', rawContent, re.DOTALL)
        if match:
            end_time = time.time()
            print(Fore.GREEN + f"✔ Data extracted successfully! Time taken: {end_time - start_time:.2f} seconds" + Style.RESET_ALL)
            return json.loads(match.group(1))
        else:
            raise ValueError("No valid JSON found in response.")
    except Exception as e:
        print(Fore.RED + f"✘ Error extracting data from Markdown: {e}" + Style.RESET_ALL)
        return []

def getEmailFromSalesQL(linkedinUrl, apiKey):
    try:
        url = f"https://api-public.salesql.com/v1/persons/enrich?linkedin_url={linkedinUrl}&api_key={apiKey}"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException:
        # print(Fore.RED + f"✘ Error fetching email for {linkedinUrl}" + Style.RESET_ALL)
        return {"emails": []}

def prioritizeEmails(emails):
    if not emails:
        return []
    workValid = [e["email"] for e in emails if e["type"] == "Work" and e["status"] == "Valid"]
    workUnverifiable = [e["email"] for e in emails if e["type"] == "Work" and e["status"] == "Unverifiable"]
    personalEmails = [e["email"] for e in emails if e["type"] == "Direct"]
    return workValid + workUnverifiable + personalEmails

def getPeopleFromCompany(companyName):
    try:
        baseString = f"site:linkedin.com/in \"{companyName}\" (\"Recruiter\" OR \"Talent Acquisition Specialist\" OR \"Hiring Manager\" OR \"HR Business Partner\" OR \"Recruitment Coordinator\") -intitle:\"profiles\" -inurl:\"dir/\" \"Recruiter\" OR \"Talent Acquisition Specialist\" OR \"Hiring Manager\" OR \"HR Business Partner\" OR \"Recruitment Coordinator\""
        
        rawResults = googleSearch(baseString, googleApiKey, googleCseId)
        with open("data/raw_results.json", "w") as raw_file:
            json.dump(rawResults, raw_file, indent=4)

        # with open("../data/raw_results.json", "r") as raw_file:
        #     rawResults = json.load(raw_file)

        cleanedResults = cleanResults(rawResults)
        markdownText = convertToMarkdown(cleanedResults)
        extractedData = extractDataFromMarkdown(markdownText)

        # with open(f"../data/extracted_data_{companyName.replace(' ', '_').replace('.', '_')}.json", "r") as file:
        #     extractedData = json.load(file)
        #     json.dump(extractedData, file, indent=4)

        print(Fore.BLUE + "Fetching emails from SalesQL..." + Style.RESET_ALL)
        peopleWithEmails = []
        uniqueDomains = set()
        for person in tqdm(extractedData, desc="Processing people", colour="cyan"):
            linkedinUrl = person.get("linkedin", "")
            if linkedinUrl:
                salesqlData = getEmailFromSalesQL(linkedinUrl, salesqlApiKey)
                person["emails"] = prioritizeEmails(salesqlData.get("emails", []))
                
                # Update empty position with title from SalesQL if available
                if not person.get("position") and salesqlData.get("title"):
                    person["position"] = salesqlData["title"]
                
                if person["emails"]:  # Only keep people with non-empty emails
                    peopleWithEmails.append(person)
                    # Extract domains from emails
                    for email in person["emails"]:
                        domain = email.split("@")[1]
                        uniqueDomains.add(domain)
        domainList = list(uniqueDomains)


        resArray = callOllama(EML_SYSTEM_PROMPT, EML_USER_PROMPT.format(domains=domainList, totalDomains=len(domainList), companyName=companyName))
        try: thisArray = json.loads(resArray)
        except: thisArray = [1] * len(domainList)
        domainResponses = list(zip(domainList, thisArray))
        excludedDomains = {'gmail.com', 'yahoo.com', 'outlook.com'}
        matchingDomains = [domain for domain, value in domainResponses   if value == 1 and domain not in excludedDomains]

        # Filter people with matching domains and keep only matching emails
        filteredPeople = []
        for person in peopleWithEmails:
            matchingEmails = [email for email in person["emails"] 
                            if any(email.endswith("@" + domain) for domain in matchingDomains)]
            if matchingEmails:
                personCopy = person.copy()
                personCopy["emails"] = matchingEmails
                filteredPeople.append(personCopy)
        
        peopleWithEmails = filteredPeople


        print(f"Found {len(peopleWithEmails)} people with company email domains")
        print(f"Matching domains: {matchingDomains}")
        print(Fore.BLUE + f"Unique domains found: {len(uniqueDomains)}" + Style.RESET_ALL)
        print(Fore.GREEN + "✔ Fetching from SalesQL completed!" + Style.RESET_ALL)
        print(Fore.BLUE + "Saving data to JSON file..." + Style.RESET_ALL)
        with open(f"data/search_results_{companyName.replace(' ', '_').replace('.', '_')}.json", "w") as file:
            json.dump(peopleWithEmails, file, indent=4)
        print(Fore.GREEN + "✔ Data saved to JSON file successfully!" + Style.RESET_ALL)
        print(Fore.GREEN + "✔ Process completed successfully!" + Style.RESET_ALL)

        return peopleWithEmails
    except Exception as e:
        print(Fore.RED + f"✘ An error occurred in the main function: {e}" + Style.RESET_ALL)

if __name__ == "__main__":
    companyName = "Entegris"
    allPeople = getPeopleFromCompany(companyName)
    print(allPeople)