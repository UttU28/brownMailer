import os
import json
import requests
from dotenv import load_dotenv
import openai
import re
from prompts import COMPACT_PROMPT

load_dotenv()
openai.api_key = os.getenv('OPENAI_API_KEY')

apiKey = os.getenv("GOOGLE_API_KEY")
cseId = os.getenv("GOOGLE_CSE_ID")

if not apiKey or not cseId:
    raise Exception("Missing GOOGLE_API_KEY or GOOGLE_CSE_ID in the environment variables.")

def googleSearch(query, apiKey, cseId):
    url = "https://www.googleapis.com/customsearch/v1"
    params = {"key": apiKey, "cx": cseId, "q": query}
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def cleanResults(rawResults):
    return [{
        "title": item.get("title", ""),
        "snippet": item.get("snippet", "").replace('\u2026', '').strip(),
        "formattedUrl": item.get("formattedUrl", "")
    } for item in rawResults.get("items", [])]

def convertToMarkdown(cleanedResults):
    return "# Search Results\n\n" + "\n\n".join([
        f"## {result['title']}\n\n**Snippet:** {result['snippet']}\n\n[Link]({result['formattedUrl']})\n\n---"
        for result in cleanedResults
    ])

def extractDataFromMarkdown(markdownText):
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", 
        messages=[
            {"role": "system", "content": "You are an AI assistant that extracts structured data ONLY from the provided Markdown content."},
            {"role": "user", "content": COMPACT_PROMPT.format(markdownText=markdownText)}
        ],
        temperature=0.0, top_p=1.0, frequency_penalty=0.0, presence_penalty=0.0  
    )
    rawContent = response['choices'][0]['message']['content'].strip()
    match = re.search(r'```json\n(.*?)\n```', rawContent, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    else:
        raise ValueError("No valid JSON found in response.")

def main():
    companyName = "Amazon Web Services"
    baseString = f"site:linkedin.com/in \"{companyName}\" (\"Recruiter\" OR \"Talent Acquisition Specialist\" OR \"Hiring Manager\" OR \"HR Business Partner\" OR \"Recruitment Coordinator\")"
    
    # rawResults = googleSearch(baseString, apiKey, cseId)
    # with open("raw_results.json", "w") as raw_file:
    #     json.dump(rawResults, raw_file, indent=4)

    with open("raw_results.json", "r") as raw_file:
        rawResults = json.load(raw_file)

    
    cleanedResults = cleanResults(rawResults)
    markdownText = convertToMarkdown(cleanedResults)
    extractedData = extractDataFromMarkdown(markdownText)
    
    with open("search_results.json", "w") as file:
        json.dump(extractedData, file, indent=4)

if __name__ == "__main__":
    main()