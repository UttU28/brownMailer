import random

NAME = "Utsav Chaudhary"
LINKEDIN_URL = "https://linkedin.com/in/utsavmaan28/"
LINKEDIN_URL_VIEW = "linkedin.com/in/utsavmaan28/"
PHONE_NUMBER = "+1(607)296-9583"
GITHUB_URL = "https://github.com/UttU28"
GITHUB_URL_VIEW = "github.com/UttU28"
PORTFOLIO_URL = "https://thatinsaneguy28.netlify.app"
PORTFOLIO_URL_VIEW = "thatinsaneguy28.netlify.app"

SUBJECT_TEMPLATE = "Hello from {yourName} – Interested in {positionTitle}"

BODY_TEMPLATES = [
    """
    <html>
    <body>
        <p>Hi {recipientName},</p>
        
        <p>I hope you’re doing well. I recently came across your profile on LinkedIn and noticed that you are part of the recruitment team at <strong>{companyName}</strong>. I have applied for the <strong>{positionTitle}</strong> position and wanted to connect directly.</p>
        
        <p>With my background in <strong>{highlightSkills}</strong>, I believe I can be a valuable asset to <strong>{companyName}</strong>. I’d be happy to provide further details about my experience if you need them.</p>
        
        <p>Please find my attached resume and cover letter, which detail my professional journey and projects. You can also review my work through the links below:</p>
        <ul>
            <li><strong>LinkedIn:</strong> <a href="{linkedinUrl}" target="_blank">{linkedinUrlView}</a></li>
            <li><strong>GitHub:</strong> <a href="{githubUrl}" target="_blank">{githubUrlView}</a></li>
            <li><strong>Portfolio:</strong> <a href="{portfolioUrl}" target="_blank">{portfolioUrlView}</a></li>
        </ul>
        
        <p>Thank you for your time. I look forward to the possibility of connecting soon.</p>
        
        <p><strong>Thanks & Regards,<br>
        {yourName}</strong><br>
        {phoneNumber}</p>
    </body>
    </html>
    """,
    """
    <html>
    <body>
        <p>Dear {recipientName},</p>
        
        <p>I trust you are well. I noticed your LinkedIn profile and learned of your role within the recruitment team at <strong>{companyName}</strong>. Having applied for the <strong>{positionTitle}</strong> position, I wanted to reach out personally.</p>
        
        <p>My expertise in <strong>{highlightSkills}</strong> has equipped me with skills that I am excited to bring to <strong>{companyName}</strong>. I would be delighted to share further insights into my professional background if you’re interested.</p>
        
        <p>Attached are my resume and cover letter that provide more detailed information about my projects and work history. Additionally, you can review my work via these links:</p>
        <ul>
            <li><strong>LinkedIn:</strong> <a href="{linkedinUrl}" target="_blank">{linkedinUrlView}</a></li>
            <li><strong>GitHub:</strong> <a href="{githubUrl}" target="_blank">{githubUrlView}</a></li>
            <li><strong>Portfolio:</strong> <a href="{portfolioUrl}" target="_blank">{portfolioUrlView}</a></li>
        </ul>
        
        <p>Thank you for considering my application. I hope we have the opportunity to connect soon.</p>
        
        <p><strong>Best Regards,<br>
        {yourName}</strong><br>
        {phoneNumber}</p>
    </body>
    </html>
    """,
    """
    <html>
    <body>
        <p>Hello {recipientName},</p>
        
        <p>I hope this message finds you in good health. I recently viewed your LinkedIn profile and was impressed to see your involvement with the recruitment team at <strong>{companyName}</strong>. I have submitted my application for the <strong>{positionTitle}</strong> role and wanted to introduce myself directly.</p>
        
        <p>My background in <strong>{highlightSkills}</strong> makes me confident that I can contribute effectively to <strong>{companyName}</strong>. I am more than happy to share further details about my experience if needed.</p>
        
        <p>For more information on my professional journey, please refer to my attached resume and cover letter. You may also review my work using the following links:</p>
        <ul>
            <li><strong>LinkedIn:</strong> <a href="{linkedinUrl}" target="_blank">{linkedinUrlView}</a></li>
            <li><strong>GitHub:</strong> <a href="{githubUrl}" target="_blank">{githubUrlView}</a></li>
            <li><strong>Portfolio:</strong> <a href="{portfolioUrl}" target="_blank">{portfolioUrlView}</a></li>
        </ul>
        
        <p>Thank you for your time and consideration. I look forward to the opportunity to connect further.</p>
        
        <p><strong>Warm Regards,<br>
        {yourName}</strong><br>
        {phoneNumber}</p>
    </body>
    </html>
    """,
    """
    <html>
    <body>
        <p>Hi {recipientName},</p>
        
        <p>I hope you’re well. I came across your profile on LinkedIn and learned that you work with the recruitment team at <strong>{companyName}</strong>. I recently applied for the <strong>{positionTitle}</strong> role and wanted to get in touch directly.</p>
        
        <p>My skills in <strong>{highlightSkills}</strong> have prepared me to be a strong candidate, and I’m excited about the opportunity to contribute to <strong>{companyName}</strong>. I would love to provide additional information regarding my background if required.</p>
        
        <p>Along with my attached resume and cover letter, you can explore more about my work by visiting the links below:</p>
        <ul>
            <li><strong>LinkedIn:</strong> <a href="{linkedinUrl}" target="_blank">{linkedinUrlView}</a></li>
            <li><strong>GitHub:</strong> <a href="{githubUrl}" target="_blank">{githubUrlView}</a></li>
            <li><strong>Portfolio:</strong> <a href="{portfolioUrl}" target="_blank">{portfolioUrlView}</a></li>
        </ul>
        
        <p>Thank you very much for your time. I look forward to the possibility of speaking with you soon.</p>
        
        <p><strong>Sincerely,<br>
        {yourName}</strong><br>
        {phoneNumber}</p>
    </body>
    </html>
    """
]


def generateEmail(recipient_name, company_name, position_title, highlight_skills):
    subject = SUBJECT_TEMPLATE.format(yourName=NAME, positionTitle=position_title)
    body = BODY_TEMPLATES[random.randint(0, len(BODY_TEMPLATES) - 1)].format(
        recipientName=recipient_name,
        companyName=company_name,
        positionTitle=position_title,
        highlightSkills=highlight_skills,
        yourName=NAME,
        linkedinUrl=LINKEDIN_URL,
        linkedinUrlView=LINKEDIN_URL_VIEW,
        phoneNumber=PHONE_NUMBER,
        githubUrl=GITHUB_URL,
        githubUrlView=GITHUB_URL_VIEW,
        portfolioUrl=PORTFOLIO_URL,
        portfolioUrlView=PORTFOLIO_URL_VIEW
    )
    return subject, body
