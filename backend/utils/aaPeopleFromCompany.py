import os
import json
import requests
from dotenv import load_dotenv
import openai
import re
from utils.prompts import COMPACT_PROMPT
import ollama
import time
from colorama import Fore, Style
from tqdm import tqdm

# Load environment variables from .env file
load_dotenv()

openAiApiKey = os.getenv('OPENAI_API_KEY')
googleApiKey = os.getenv("GOOGLE_API_KEY")
googleCseId = os.getenv("GOOGLE_CSE_ID")
salesqlApiKey = os.getenv("SALESQL_API_KEY")

if not openAiApiKey or not googleApiKey or not googleCseId or not salesqlApiKey:
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
        response = ollama.chat(
            model='llama3.2', 
            messages=[
                {"role": "system", "content": "You are an AI that extracts structured data ONLY from Markdown and returns JSON."},
                {"role": "user", "content": COMPACT_PROMPT.format(markdownText=markdownText)}
            ],
            options={
                "temperature": 0.0,
                "top_p": 1.0,
                "frequency_penalty": 0.0,
                "presence_penalty": 0.0
            }
        )
        rawContent = response['message']['content'].strip()
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
        baseString = f"site:linkedin.com/in \"{companyName}\" (\"Recruiter\" OR \"Talent Acquisition Specialist\" OR \"Hiring Manager\" OR \"HR Business Partner\" OR \"Recruitment Coordinator\")"
        
        rawResults = googleSearch(baseString, googleApiKey, googleCseId)
        # with open("data/raw_results.json", "w") as raw_file:
        #     json.dump(rawResults, raw_file, indent=4)

        # with open("data/raw_results.json", "r") as raw_file:
        #     rawResults = json.load(raw_file)

        cleanedResults = cleanResults(rawResults)
        markdownText = convertToMarkdown(cleanedResults)
        extractedData = extractDataFromMarkdown(markdownText)

        print(Fore.BLUE + "Fetching emails from SalesQL..." + Style.RESET_ALL)
        peopleWithEmails = []
        for person in tqdm(extractedData, desc="Processing people", colour="cyan"):
            linkedinUrl = person.get("linkedin", "")
            if linkedinUrl:
                emails = getEmailFromSalesQL(linkedinUrl, salesqlApiKey)
                person["emails"] = prioritizeEmails(emails.get("emails", []))
                if person["emails"]:  # Only keep people with non-empty emails
                    peopleWithEmails.append(person)
        
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