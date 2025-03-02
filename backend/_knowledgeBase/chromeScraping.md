# Setting Up Google Custom Search API for Brown Mailer

Welcome to the **Search API Setup** guide! Follow these steps to enable and configure **Google Custom Search API** for your project. If you’re thinking, "This looks complicated," don’t worry—it’s easier than assembling IKEA furniture. Let’s get started! 🚀

---

## 🔍 Step 1: Enable Google Custom Search API
1. Go to the **Google Cloud Console** → [Google Cloud API Library](https://console.cloud.google.com/apis/library).
2. Search for **Custom Search API** and **enable** it.
3. That’s it for this part—smooth, right? Now, onto the fun stuff.

---

## ⚙️ Step 2: Create a Custom Search Engine (CSE)
Now, we need a **Custom Search Engine (CSE)**—because Google needs to know *where* you want to search.

1. Head over to [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all).
2. Click **Add** → Give it a **name**.
3. Under **Sites to Search**, enter `linkedin.com` (or any other site you want to scrape data from).
4. Click **Create** and then **Control Panel**.
5. Find the **Search Engine ID**—this is your **GOOGLE_CSE_ID**.
6. Copy it and save it in your `.env` file as:
   ```
   GOOGLE_CSE_ID=your_cse_id_here
   ```

Now Google knows what you're searching for—time to give it some superpowers. 🦸‍♂️

---

## 🔑 Step 3: Get an API Key
Google won’t just let *anyone* use its API—you need a key to the kingdom.

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**.
2. Click **Create Credentials** → Select **API Key**.
3. Google will generate a magical string—your **API key**.
4. Copy this key and add it to your `.env` file:
   ```
   GOOGLE_API_KEY=your_api_key_here
   ```
5. Keep this key **private**—don’t go posting it on Stack Overflow like an amateur. 🔐

---

## 🎉 Step 4: All Set!
Now your **Google Custom Search API** is ready to roll! 🏁 You can use it to fetch search results programmatically in Brown Mailer.

### Final Checklist ✅
✔ Custom Search API enabled
✔ CSE created and ID saved in `.env`
✔ API key generated and saved in `.env`

Now, go forth and scrape responsibly! 🚀

---

## 🤓 A Not-Required Word of Wisdom
With great API power comes great responsibility. Google is watching, so don’t abuse their kindness. Keep your API requests **efficient**, your keys **private**, and your searches **relevant**. 

And remember—every good dev knows that **reading the documentation beats debugging for hours.** 😉
