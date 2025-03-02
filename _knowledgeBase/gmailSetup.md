# Setting Up Google Gmail API for Brown Mailer

Welcome to **Brown Mailer**! Follow these steps to configure **Google Cloud Services** and enable Gmail API for your project.

---

## 🚀 Step 1: Enable Gmail API

1. Head over to the **Google Cloud Console**: [https://console.cloud.google.com/](https://console.cloud.google.com/).
2. Navigate to **APIs & Services** → **Library**.
3. Search for **Gmail API** and enable it.

---

## 🎯 Step 2: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → **OAuth Client ID**.
3. Select **Application Type** as **Desktop App**.
4. Give it a name (e.g., "Brown Mailer OAuth").
5. Click **Create** and **Download** the `credentials.json` file.
6. Move `credentials.json` to the `tokens` directory in your project.

---

## 👤 Step 3: Add Yourself as a Test User

1. Go to **APIs & Services** → **OAuth Consent Screen** → **Audience**.
2. Under **Test Users**, add your **Google account email**.
3. Save your changes.

🚨 **DO NOT SHARE YOUR TOKENS OR CREDENTIALS WITH ANYONE.** If you do, you might as well hand them your wallet, house keys, and a signed blank check. Be smart. Stay secure. 💀🔐

---

## 🔥 Step 4: Generate the Token

1. Open a terminal or command prompt.
2. Navigate to your project directory.
3. Run:
   ```bash
   python oAuthSetup.py
   ```
4. Follow the Google authentication flow in your browser.
5. If you see a security warning about the app being "unsafe," click **Continue**—Google just likes to be overprotective.
6. If successful, a **token file** will be generated and stored automatically.

---

## ✅ Done!

That’s it! Your Gmail API is now **fully configured** for Brown Mailer.
You can start sending drafts, emails, and automating your inbox. 🚀📩

Enjoy your mailing adventures! And again, **DON’T SHARE YOUR TOKENS!** 🔥

