# Brown Mailer: The Job Hunt Automation You Deserve
(coz im not black)

## Overview 🚀

Are you tired of automated rejection emails? Ever wish you could send a few automated emails yourself? Well, now you can! **Brown Mailer** is here to help you scrape recruiter emails, extract their details, and send them beautifully crafted emails (with your resume and cover letter attached, of course).

## What This Does 🤖

- **Searches for recruiters, HRs, and hiring managers** at a specific company using **Google Custom Search API**.
- **Scrapes LinkedIn profiles** and extracts names, positions, and company details using **Llama3.2 via Ollama** (or OpenAI if you prefer).
- **Fetches professional email addresses** using **SalesQL API** so you don’t have to guess them.
- **Generates and sends personalized emails** using **Gmail API**, ensuring each email is unique and **does NOT land in spam**.
- **Supports multiple email templates**, so recruiters don’t think you’re a robot (even though... you kind of are, but let’s keep that a secret). 😉

---

## Setup 🛠️

### 1️⃣ Google Custom Search API (Finding Recruiters)

1. Go to [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all) and **create a Custom Search Engine (CSE)**.
2. **Set it to search LinkedIn profiles only** (use the site filter `site:linkedin.com/in`).
3. Copy the **CSE ID** and save it as `GOOGLE_CSE_ID` in your `.env` file.
4. Go to **Google Cloud Console → APIs & Services → Credentials**.
5. **Create an API key**, then copy and save it as `GOOGLE_API_KEY` in your `.env` file.

### 2️⃣ SalesQL API (Fetching Emails)

1. Create an account at [SalesQL](https://salesql.com/) and get an **API key**.
2. Save it as `SALESQL_API_KEY` in your `.env` file.

### 3️⃣ Gmail API (Automated Emails)

1. Enable the **Gmail API** in [Google Cloud Console](https://console.cloud.google.com/).
2. Go to **APIs & Services → Credentials → Create OAuth Client ID** (choose Desktop App).
3. Download the `credentials.json` file and place it in the `tokens/` folder.
4. Go to **OAuth consent screen → Test users** and add your email.
5. Run `oAuthSetup.py` to generate your `token.pickle` file.

### 4️⃣ Install Dependencies

Run:

```sh
pip install -r requirements.txt
```

---

## Usage ⚡

1. Edit `emailTemplates.py` to personalize your email templates.
2. Run the main script:

```sh
python main.py
```

3. Sit back and let the recruiters get a taste of their own medicine (automated emails, but from YOU!).

---

## Notes & Warnings ⚠️

- **DO NOT SPAM.** Sending too many emails in a short time may flag your account.
- **Make sure to personalize your emails** to avoid looking like a bot.
- **DO NOT SHARE your API keys or credentials**. Seriously, don’t.

---

## Words of Wisdom ✨

> "If recruiters can automate rejection emails, you can automate job applications. Balance the equation." – ThatInsaneGuy || UttU28

Now go forth and land that dream job! 🚀

