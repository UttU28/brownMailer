# ![Brown Mailer Icon](xTension/icon48.png)  Brown Mailer: Backend - Step 1: Welcome to Hell 🔥

## 🎉 Congrats, You Actually Read the Instructions!

I’ll be honest—I didn’t think you’d make it. Most people would have rage-quit by now, complaining about how "this is too complicated" while Googling "how to become an influencer instead." But not you. You’re here. You’re **built different**. Or maybe just stubborn—either way, let’s get this thing running.

Now, focus. This is **Step 1**, aka "Setting Up The Backend So The Extension Doesn’t Just Sit There Looking Pretty." Follow these steps **exactly**, or go back to your vanilla job search and keep refreshing your inbox for that rejection email.

---

## 🔥 Setting Up Your Backend (Yes, You Need This)

### 1️⃣ Create a Virtual Environment & Install Dependencies

First, create and activate a virtual environment:

```sh
python -m venv venv
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate    # Windows
```

Then, install the required dependencies:

```sh
pip install -r requirements.txt
```

If you made it this far, congrats—you can type commands. Let’s move on.

---

### 2️⃣ Set Up Google API Key & Google Custom Search ID

You will need a **Google API Key** and a **Google Custom Search Engine (CSE) ID** to fetch recruiter details.

Follow the **ancient scrolls** (aka `backend ↷ _knowledgeBase ↷ customSearchAPI.md`) to set them up using **Google Cloud Services**.

Once completed, add these sacred texts to your `.env` file:

```sh
GOOGLE_API_KEY=google_api_key
GOOGLE_CSE_ID=google_cse_id
```

If this part confused you, go back and actually read the docs. We’re not doing this twice.

---

### 3️⃣ Set Up Gmail API for Sending Emails (Because We’re Not Cavemen)

Follow the steps in `backend ↷ _knowledgeBase ↷ gmailAPI.md` to enable **Gmail API** and obtain the necessary credentials.

When downloading the **credentials.json** file, **rename it properly as ********************`credentials.json`******************** and save it in the ********************`tokens/`******************** directory**. The script is expecting it there, so don’t get creative.

Add these to your `.env` file:

```sh
GMAIL_USER_EMAIL=gmail_user_email
GMAIL_SERVICE_ACCOUNT_FILE=tokens/credentials.json
GMAIL_TOKEN_FILE=tokens/gmailToken.pickle  # Will be automatically generated
```

Once this is set up, run:

```sh
python oAuthSetup.py
```

This will prompt you to log in to your **primary Gmail account** (aka the one that’s not filled with spam and forgotten newsletters). Once completed, the token will be saved as `gmailToken.pickle` in the `tokens/` directory.

🚨 **You only need to run this once**—if you mess it up, you’re on your own.

---

### 4️⃣ Set Up SalesQL & OpenAI API (Optional, But Smart)

1. **SalesQL API Key** (for fetching recruiter emails, required):

   - Create an account at [SalesQL](https://salesql.com/) and get an API key.
   - Add it to your `.env` file:

   ```sh
   SALESQL_API_KEY=salesql_api_key
   ```

   - You can also use alternative email-finding services if needed.

2. **OpenAI API Key** (optional, if using OpenAI instead of Ollama for AI tasks):

   - Get your API key from [OpenAI](https://platform.openai.com/) (only required if you’re not using Ollama).
   - Add it to your `.env` file:

   ```sh
   OPENAI_API_KEY=openai_api_key
   ```

   - If you’re using **Ollama**, ignore this. You’re already ahead of the game.

---

### 5️⃣ Save Your Resume & Cover Letter (Yes, They’re Required)

Rename your **resume** and **cover letter** as `resume.pdf` and `coverLetter.pdf` (capitalization matters!) and **save them in the ********************`data/`******************** directory** in the backend.

Why? Because this script will automatically:

- **Extract skills** from your resume.
- **Generate a killer email** using AI.
- **Attach your resume & cover letter** so you don’t look like a bot.

It’s almost like having an assistant, except it won’t call in sick.

---

### 6️⃣ Run the Backend Server (So Stuff Actually Works)

Once everything is set up, start the backend server:

```sh
python app.py
```

This will start a **FastAPI** server on **port 3000**. The Chrome Extension will communicate with this backend to fetch recruiter details and send emails.

If this doesn’t work, check your setup **before** blaming me.

---

## 🚀 Now What?

1. Open the Chrome extension and enter a company name (if not on a LinkedIn job page).
2. Let the extension **track down recruiters** like a job-hunting bounty hunter.
3. Click **Send Email** and let AI craft a **tailored** job application.
4. Wait for responses… or blocks. Either way, you made an impression.

---

## ⚠️ A Few Friendly Warnings

- **DO NOT SPAM.** You don’t want to end up on some recruiter’s blacklist.
- **DO NOT SHARE your API keys.** Unless you enjoy getting your accounts banned.
- **Yes, this is 100% legal.** Probably.

---


## 🚨 THERE IS A STEP 2, YOU SON OF YOUR MOTHER.
