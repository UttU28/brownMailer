# oauthSetup.py

import os
import pickle
import google.auth.transport.requests
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.exceptions import RefreshError
from dotenv import load_dotenv

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/gmail.compose"]

def authenticate_gmail():
    creds = None
    token_file = os.getenv("GMAIL_TOKEN_FILE")

    if os.path.exists(token_file):
        with open(token_file, "rb") as token:
            creds = pickle.load(token)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(google.auth.transport.requests.Request())
            except RefreshError:
                creds = None
        if not creds:
            flow = InstalledAppFlow.from_client_secrets_file(
                os.getenv("GMAIL_SERVICE_ACCOUNT_FILE"), SCOPES
            )
            creds = flow.run_local_server(port=0)

        with open(token_file, "wb") as token:
            pickle.dump(creds, token)

    return creds

if __name__ == "__main__":
    authenticate_gmail()
    print("✔ OAuth setup complete! Token saved.")