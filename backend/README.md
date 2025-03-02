# Brown Mailer: The Job Hunt Automation You Deserve
(coz I'm not black, but I'm efficient.)

## Overview 🚀

Sick of automated rejection emails? Wish you could flip the script and send some strategic, well-crafted cold emails to recruiters instead? **Brown Mailer** is your secret weapon for automating recruiter outreach, fetching contact details, and making your job hunt a breeze.

## What This Does 🤖

- **Finds recruiters, HRs, and hiring managers** from specific companies using **Google Custom Search API**.
- **Scrapes LinkedIn profiles** to extract names, positions, and companies via **Llama3.2 via Ollama** (or OpenAI if you fancy).
- **Fetches real, professional emails** using **SalesQL API**, so you’re not guessing addresses.
- **Generates and sends hyper-personalized emails** via **Gmail API**, avoiding spam filters.
- **Supports multiple email templates**, keeping your messages fresh and engaging.

---

## Setup 🛠️

### 1️⃣ Google Custom Search API (Finding Recruiters)

1. Create a Custom Search Engine (CSE) at [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all).
2. Set it to search **LinkedIn profiles only** (`site:linkedin.com/in`).
3. Copy the **CSE ID** and save it in your `.env` as `GOOGLE_CSE_ID`.
4. Head to **Google Cloud Console → APIs & Services → Credentials**.
5. Generate an **API key** and save it as `GOOGLE_API_KEY`.

### 2️⃣ SalesQL API (Fetching Emails)

1. Sign up at [SalesQL](https://salesql.com/) and get an **API key**.
2. Save it as `SALESQL_API_KEY` in your `.env`.

### 3️⃣ Gmail API (Automated Emails)

1. Enable the **Gmail API** via [Google Cloud Console](https://console.cloud.google.com/).
2. Navigate to **APIs & Services → Credentials → Create OAuth Client ID** (choose Desktop App).
3. Download `credentials.json` and place it in `tokens/`.
4. Add your email to the **OAuth consent screen** under **Test users**.
5. Run `oAuthSetup.py` to generate your `token.pickle`.

### 4️⃣ Install Dependencies

```sh
pip install -r requirements.txt
```

---

## How It Works ⚡

### **Backend (FastAPI Server - `app.py`)**

The **FastAPI** server powers our recruiter-fetching mechanism. It’s got:

- **CORS enabled** (so frontend apps can interact without drama).
- A **`/getPeople` endpoint** that:
  - Takes a `companyName` as input.
  - Calls `getPeopleFromCompany()` to fetch recruiters from Google Search.
  - Returns recruiter details in JSON format.

#### **Run the server:**
```sh
uvicorn app:app --host 0.0.0.0 --port 3000 --reload
```

You can then hit the endpoint:
```sh
POST http://localhost:3000/getPeople
{
    "companyName": "Google"
}
```

And get back a structured list of recruiters from **Google** (or any company you specify).

---

## Usage ⚡

1. **Personalize your email templates** in `emailTemplates.py`.
2. **Fire up the system:**

```sh
python app.py
```

3. Let the recruiters **taste their own medicine** (automated emails, but from you!).

---

## Notes & Warnings ⚠️

- **Don't abuse it!** Sending too many emails too quickly might get your Gmail flagged.
- **Personalize emails** to avoid looking spammy.
- **Never share API keys**—unless you enjoy random people sending emails on your behalf.

---

## Final Words of Wisdom ✨

> "If recruiters can automate rejections, you can automate applications. Balance the equation." – ThatInsaneGuy || UttU28

Go get that dream job, legend! 🚀

