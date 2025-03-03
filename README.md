# Brown Mailer: coz I'm not Black. Mailing you!

## ![Brown Mailer Icon](xTension/icons/icon128.png)  Not Required Words of Wisdom 🤔
If recruiters can automate rejection emails, why can’t we automate hope? Or is this just a simulation, and we’re all bots in someone else’s Chrome extension? 🤖 Lets spam the spammers. GG Boys.

---

## 🚀 The Ultimate AI-Powered Cold Emailer ||--> Chrome Extension + AI-Powered Backend Project

Welcome to **the most absurdly efficient, LLM-enhanced Chrome extension + backend duo** you've ever seen! This project seamlessly scrapes LinkedIn job pages, hunts for recruiters, verifies technical skills, and crafts killer emails. Say goodbye to hours of job-hunting drudgery and hello to **automation supremacy**.

---

## 🤬 WHY I BUILT THIS

I am **sick and tired** of recruiters **rejecting my job applications** without even **reading them**. These HR people have fancy bots and automated scripts to **reject us instantly**—so why not hit them back with **our own automation**?

It's time to **fight back**. Instead of waiting for them to send us rejection emails, we’ll **spam them all day, all night** asking for a job until they **reply or block us**. Either way, you weren’t getting the job in the first place—so **who cares?** At least now they’ll be afraid of **us** for once.


---
## 🎯 What This Does
✅ **Auto-Detects LinkedIn Job Pages** → Instantly scrapes job details.  
✅ **Finds Recruiters & HR People** → Fetches their email & LinkedIn profiles.  
✅ **Extracts & Verifies Key Technical Skills** → AI filters out junk.  
✅ **Generates Smart Emails** → Sends personalized, **LLM-powered** messages.  
✅ **Manual Mode for Non-LinkedIn Pages** → Enter a company name & get recruiter details.  
✅ **Caches Data for Speed** → No redundant requests, just **blazing-fast** results.  
✅ **Use ChatGPT API Instead of Ollama** → If your system isn’t powerful enough (*cough* noobs).  
✅ **Uses Google Search API & Gmail API** → Finds recruiters and sends emails directly from your inbox.  

---
## 🔥 The Flow (Simple & Smart)

### 🌍 **Chrome Extension Workflow**
1. **Popup Opens** → Detects if you're on a LinkedIn job page.
2. **LinkedIn Job Page Found?**
   - ✅ Scrapes company, position, job ID, and job description.
   - ✅ Calls `/getPeople` to find recruiters.
   - ✅ Displays recruiters' names, emails (domain-only), and LinkedIn profiles.
   - ✅ Allows sending **tailored** AI-generated emails with one click.
3. **Not on a LinkedIn Job Page?** (Manual Mode Activated 🔥)
   - 🔹 Asks you to enter a company name.
   - 🔹 Fetches recruiter & HR people details from the backend.
   - 🔹 Displays results with LinkedIn & email.
   - 🔹 One-click AI-powered email sending!

### ⚡ **Backend Workflow (FastAPI Magic)**
1. **Handles Recruiter Search (`/getPeople`)**
   - 🔹 Checks the cache for existing results.
   - 🔹 If not cached, scrapes and fetches recruiter details.
   - 🔹 Uses **Google Search API** to enhance recruiter lookup.
   - 🔹 Returns results instantly.
2. **Processes Job Descriptions (`/sendEmail`)**
   - 🧠 **Extracts key skills** using `HLTS_SYSTEM_PROMPT`.
   - ✅ **Verifies & refines skills** using `VRFY_SYSTEM_PROMPT`.
   - ✉️ **Creates an AI-powered tailored email draft**.
   - 📩 **Uses Gmail API to send the email** directly from your inbox.
3. **Caches Data for Efficiency**
   - 🔹 Stores company search results.
   - 🔹 Saves job descriptions in a database for future reference.

---
## 🔧 **Key Technologies Used**
🛠 **Chrome Extension API** → Handles scraping & UI interactions.  
🚀 **FastAPI** → Powers backend requests.  
🧠 **Ollama (LLM) or ChatGPT API** → Extracts skills & crafts smart emails.  
![Brown Mailer Icon](xTension/icons/icon16.png)  **Gmail API** → Sends emails from your personal email account.  
🔎 **Google Search API** → Finds recruiter contacts. 
📧 **SalesQL (or alternatives)** → Retrieves recruiter emails. 
🔍 **BeautifulSoup** → Parses job descriptions cleanly.  
💾 **Chrome Storage & JSON Caching** → Instant data retrieval.  
📊 **Database Storage** → Saves job postings for reference.  

---
## 🎯 **The Mission**
To **obliterate** manual LinkedIn searches, **eliminate** time-wasting recruiter outreach, and **automate** smart, AI-driven networking. If a recruiter doesn’t reply, it’s not on you—it’s on them. 😉

---
## ⚡ **Why This Is So Damn Useful**
🔥 **Saves time** → No more manual recruiter searches.  
💡 **Boosts engagement** → AI-powered emails stand out.  
🔍 **Filters noise** → Only **relevant skills** are extracted.  
🎯 **Works even outside LinkedIn** → Manual search mode included.  
![Brown Mailer Icon](xTension/icons/icon16.png)  **Emails recruiters directly from your inbox** → No manual copy-pasting.  
🤖 **Flexible AI Choices** → Use **Ollama locally** or **ChatGPT API** if you don’t have a beefy system.  

🚀 **Get started. Automate. Dominate.** 🚀

