# Google Custom Search API Script

## Overview
This Python script utilizes the **Google Custom Search API** to perform a web search using a Google Custom Search Engine (CSE). The script loads API credentials from a `.env` file, constructs a search query targeting LinkedIn profiles related to recruitment roles, and stores the search results in a JSON file.

## Prerequisites
Before running this script, ensure you have:
- A **Google API Key** for the Custom Search API.
- A **Google Custom Search Engine (CSE) ID**.
- Python installed on your system.
- Required Python packages (`requests` and `python-dotenv`).

## Setup Instructions

### Step 1: Get Your Google CSE ID & API Key
1. **Enable Google Custom Search API** in [Google Cloud Console](https://console.cloud.google.com/).
2. **Create a Custom Search Engine (CSE)** at [Google Programmable Search Engine](https://programmablesearchengine.google.com/controlpanel/all).
3. **Copy your CSE ID** from the control panel.
4. **Generate an API Key** from Google Cloud Console.

### Step 2: Install Dependencies
Run the following command to install required packages:
```bash
pip install requests python-dotenv
```

### Step 3: Create a `.env` File
In the same directory as your script, create a `.env` file and add:
```ini
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CSE_ID=your_custom_search_engine_id_here
```

### Step 4: Run the Script
Execute the script using:
```bash
python your_script_name.py
```

## Functionality
- Loads API credentials from the `.env` file.
- Constructs a Google search query specifically for LinkedIn recruiter profiles.
- Sends a request to the Google Custom Search API.
- Saves the search results in a file named `result.json`.

## Output
The script generates a `result.json` file containing search results from Google Custom Search API.

## Notes
- Ensure that your CSE is configured to search LinkedIn or the desired websites.
- Modify the search query in the script to fit your needs.

Happy coding! 🚀