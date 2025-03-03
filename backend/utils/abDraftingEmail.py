import os
import base64
import pickle
from googleapiclient.discovery import build
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from dotenv import load_dotenv
from emailTemplate import generateEmail
from colorama import Fore, Style

load_dotenv()

fullName = os.getenv("FULL_NAME")
tokenFile = os.getenv("GMAIL_TOKEN_FILE")
attachmentFiles = {
    "data/resume.pdf": f"{fullName} Resume.pdf",
    "data/coverLetter.pdf": f"{fullName} Cover Letter.pdf"
}

if not os.path.exists(tokenFile):
    print(Fore.RED + "✘ Token file not found. Please run oAuthSetup.py first and then run this script." + Style.RESET_ALL)
    exit(1)
    
def getGmailService():

    try:
        with open(tokenFile, "rb") as token:
            creds = pickle.load(token)
        print(Fore.GREEN + "✔ Gmail Service Created Successfully" + Style.RESET_ALL)
        return build("gmail", "v1", credentials=creds)
    except Exception as e:
        print(Fore.RED + f"✘ Error loading Gmail service: {e}" + Style.RESET_ALL)
        return None

def createDraft(toEmail, recipientName, companyName, positionTitle, highlightSkills):
    service = getGmailService()
    if not service:
        return None
    
    subject, body = generateEmail(recipientName, companyName, positionTitle, highlightSkills)
    message = MIMEMultipart()
    message["to"] = toEmail
    message["subject"] = subject
    message.attach(MIMEText(body, "html"))

    for filePath, uploadName in attachmentFiles.items():
        if os.path.exists(filePath):
            with open(filePath, "rb") as file:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(file.read())
                encoders.encode_base64(part)
                part.add_header("Content-Disposition", f"attachment; filename={uploadName}")
                message.attach(part)
            print(Fore.GREEN + f"✔ Attachment Added: {uploadName}" + Style.RESET_ALL)
        else:
            print(Fore.YELLOW + f"⚠️ Warning: Attachment Not Found: {filePath}. Skipping." + Style.RESET_ALL)
    
    encodedMessage = base64.urlsafe_b64encode(message.as_bytes()).decode("utf-8")
    draft = {"message": {"raw": encodedMessage}}
    
    try:
        createdDraft = service.users().drafts().create(userId="me", body=draft).execute()
        print(Fore.GREEN + f"✔ Draft created successfully! Draft ID: {createdDraft['id']}" + Style.RESET_ALL)
        return createdDraft
    except Exception as e:
        print(Fore.RED + f"✘ Error creating draft: {e}" + Style.RESET_ALL)
        return None

if __name__ == "__main__":
    # Example usage
    recipientName = "Mahesh Bhatt"
    recipientEmail = "mahesh@bhattfamily.com"
    companyName = "Google"
    positionTitle = "Software Engineer"
    highlightSkills = "Python, Java, C++"
    
    createDraft(recipientEmail, recipientName, companyName, positionTitle, highlightSkills)
