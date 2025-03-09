// Base URL for API calls
const BASE_URL = 'http://localhost:3000';

// Global variables
let currentJobInfo = null;
let messageInterval;


async function getLinkedInJobData() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
            const positionElement = document.querySelector('.job-details-jobs-unified-top-card__job-title h1');
            const applyButton = document.querySelector('.jobs-apply-button');
            const jobId = applyButton ? applyButton.getAttribute('data-job-id') : '';
            let jobDescriptionHtml = null;
            // Combine selectors from all parts of your code
            const selectors = [
                '.jobs-description__content',
                '.jobs-box--fadein.jobs-description',
                '.jobs-box--fadein article',
                '#job-details',
                '.jobs-description-content__text--stretch',
                'article.jobs-description__container'
            ];
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element) {
                    jobDescriptionHtml = element.outerHTML;
                    break;
                }
            }
            const hasDescription = !!jobDescriptionHtml;
            return {
                company: companyElement ? companyElement.textContent.trim() : null,
                position: positionElement ? positionElement.textContent.trim() : null,
                jobId,
                jobDescriptionHtml,
                hasDescription
            };
        }
    });
    return result[0].result;
}

/* ---------------------------
   Update Status Indicators
   ---------------------------
   When on a LinkedIn job page, update the company, position, and description indicators.
*/
function updateStatusIndicators(isLinkedInJobPage = false) {
    const companyStatus = document.getElementById('company-status');
    const companyLabel = document.getElementById('company-label');
    const companyValue = document.getElementById('company-value');
    const positionStatus = document.getElementById('position-status');
    const positionLabel = document.getElementById('position-label');
    const positionValue = document.getElementById('position-value');
    const descriptionStatus = document.getElementById('description-status');
    const descriptionLabel = document.getElementById('description-label');
    const descriptionValue = document.getElementById('description-value');

    if (!isLinkedInJobPage) {
        // Red status for all when not on LinkedIn jobs page
        companyStatus.className = 'status-light red';
        positionStatus.className = 'status-light red';
        descriptionStatus.className = 'status-light red';
        
        companyValue.textContent = 'COMPANY MISSING';
        positionValue.textContent = 'POSITION MISSING';
        descriptionValue.textContent = 'DESCRIPTION MISSING';
        
        companyLabel.style.display = 'none';
        positionLabel.style.display = 'none';
        descriptionLabel.style.display = 'none';
        return;
    }

    // Use unified scraping function
    getLinkedInJobData().then(jobData => {
        if (jobData.company) {
            companyStatus.className = 'status-light green';
            companyValue.textContent = jobData.company.toUpperCase();
        } else {
            companyStatus.className = 'status-light yellow';
            companyValue.textContent = 'COMPANY MISSING';
        }
    
        if (jobData.position) {
            positionStatus.className = 'status-light green';
            positionValue.textContent = jobData.position.toUpperCase();
        } else {
            positionStatus.className = 'status-light yellow';
            positionValue.textContent = 'POSITION MISSING';
        }
    
        if (jobData.hasDescription) {
            descriptionStatus.className = 'status-light green';
            descriptionValue.textContent = 'DESCRIPTION FOUND';
        } else {
            descriptionStatus.className = 'status-light yellow';
            descriptionValue.textContent = 'DESCRIPTION NOT FOUND';
        }
        
        companyLabel.style.display = 'none';
        positionLabel.style.display = 'none';
        descriptionLabel.style.display = 'none';
    });
}

/* ---------------------------
   Load Previous Results
   ---------------------------
   If on a LinkedIn job page, immediately get company info and trigger a search.
   Otherwise, load the last search results from storage.
*/
async function loadPreviousResults() {
    const responseContainer = document.getElementById("responseContainer");
    const companyHeader = document.getElementById("companyHeader");
    const inputContainer = document.querySelector('.input-container');
    const loadingMessage = document.getElementById("loadingMessage");
    const companyInput = document.getElementById("companyInput");

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
            inputContainer.style.display = 'flex';

            // Get company name immediately using our unified function
            const jobData = await getLinkedInJobData();
            const companyName = jobData.company;
            if (companyName) {
                companyInput.value = companyName;
                companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${companyName}</span>`;
                companyHeader.style.display = "block";
                loadingMessage.style.display = "flex";
                startLoadingAnimation(companyName);
            }

            // Auto-trigger search from the job page
            await searchFromJobPage(tab);
        } else {
            const result = await chrome.storage.local.get(['lastSearchResults', 'lastCompanyName']);
            if (result.lastSearchResults && result.lastSearchResults.length > 0) {
                responseContainer.style.display = "block";
                companyInput.value = "";
                
                if (result.lastCompanyName) {
                    companyHeader.innerHTML = `<span class="results-text">Results for:</span> <span class="company-name">${result.lastCompanyName}</span>`;
                    companyHeader.style.display = "block";
                } else {
                    companyHeader.style.display = "none";
                }

                displayResults(result.lastSearchResults);
            }
        }
    } catch (error) {
        console.error("Error loading previous results:", error);
    }
}

/* ---------------------------
   Search from Job Page
   ---------------------------
   Uses getLinkedInJobData to get job info and then triggers the API call.
*/
async function searchFromJobPage(tab) {
    try {
        const jobData = await getLinkedInJobData();
        const { company, position, jobId, jobDescriptionHtml } = jobData;
        if (!company) {
            throw new Error('Could not find company name on the page');
        }

        // Store the job info globally so it can be used for emails
        currentJobInfo = {
            position: position,
            jobId: jobId,
            jobDescriptionHtml: jobDescriptionHtml
        };

        const loadingMessage = document.getElementById("loadingMessage");
        const responseContainer = document.getElementById("responseContainer");
        const companyHeader = document.getElementById("companyHeader");
        const companyInput = document.getElementById("companyInput");

        companyInput.value = company;
        loadingMessage.style.display = "flex";
        responseContainer.style.display = "none";
        
        companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${company}</span>`;
        companyHeader.style.display = "block";
        
        startLoadingAnimation(company);
        
        const response = await fetch(`${BASE_URL}/getPeople`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyName: company })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        await saveToStorage(data.data, company);
        
        companyHeader.innerHTML = `<span class="results-text">Results for:</span> <span class="company-name">${company}</span>`;
        displayResults(data.data);
        responseContainer.style.display = "block";
        companyInput.value = "";
    } catch (error) {
        console.error("Error:", error);
        const errorRow = document.createElement('tr');
        const errorCell = document.createElement('td');
        errorCell.setAttribute('colspan', '4');
        errorCell.className = 'error-message';
        errorCell.textContent = error.message || 'Failed to fetch data';
        errorRow.appendChild(errorCell);
        document.querySelector("#resultsTable tbody").innerHTML = '';
        document.querySelector("#resultsTable tbody").appendChild(errorRow);
    } finally {
        stopLoadingAnimation();
        document.getElementById("loadingMessage").style.display = "none";
        document.getElementById("companyInput").value = "";
    }
}

/* ---------------------------
   Save Data to Storage
--------------------------- */
async function saveToStorage(data, companyName) {
    try {
        if (chrome && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({
                lastSearchResults: data,
                lastCompanyName: companyName
            });
        }
    } catch (error) {
        console.error("Error saving to storage:", error);
    }
}

/* ---------------------------
   Display Results
--------------------------- */
function displayResults(data) {
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = "";

    if (!document.querySelector('.notification')) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }

    if (!data || data.length === 0) {
        const noResultsRow = document.createElement('tr');
        const noResultsCell = document.createElement('td');
        noResultsCell.setAttribute('colspan', '4');
        noResultsCell.className = 'no-results';
        noResultsCell.textContent = 'No results found.';
        noResultsRow.appendChild(noResultsCell);
        tableBody.appendChild(noResultsRow);
        return;
    }

    // Refresh job info if we're on a LinkedIn job page
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
            const jobData = await getLinkedInJobData();
            currentJobInfo = jobData;
        }
    });

    data.forEach(person => {
        const firstEmail = person.emails.length > 0 && person.emails[0] !== "undefined" ? person.emails[0] : "-";
        const secondEmail = person.emails.length > 1 && person.emails[1] !== "undefined" ? person.emails[1] : "-";
        const personPosition = person.position || "No position listed";
        const linkedinURL = person.linkedin || "#";
        
        const firstDomain = firstEmail !== "-" && firstEmail !== "undefined" ? "@" + firstEmail.split('@')[1] : "-";
        const secondDomain = secondEmail !== "-" && secondEmail !== "undefined" ? "@" + secondEmail.split('@')[1] : "-";
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="${linkedinURL}" target="_blank" class="name-with-linkedin" title="View LinkedIn Profile">
                    <i class="fab fa-linkedin"></i>
                    <span class="name-text">${person.fullName}</span>
                </a>
            </td>
            <td class="position" title="${personPosition}">${personPosition}</td>
            <td class="email-cell">
                <div class="email-container">
                    <div class="email-text" title="${firstEmail}">${firstDomain}</div>
                    ${firstEmail !== "-" ? `
                    <div class="email-dropdown">
                        <button class="dropdown-option copy-option" data-email="${firstEmail}">
                            <i class="fas fa-copy"></i> Copy Email
                        </button>
                        <button class="dropdown-option send-option" 
                            data-email="${firstEmail}" 
                            data-name="${person.fullName}"
                            data-person-position="${personPosition}"
                            data-job-position="${currentJobInfo ? currentJobInfo.position : ''}">
                            <i class="fas fa-paper-plane"></i> Send Email
                        </button>
                    </div>
                    ` : ''}
                </div>
            </td>
            <td class="email-cell">
                <div class="email-container">
                    <div class="email-text" title="${secondEmail}">${secondDomain}</div>
                    ${secondEmail !== "-" ? `
                    <div class="email-dropdown">
                        <button class="dropdown-option copy-option" data-email="${secondEmail}">
                            <i class="fas fa-copy"></i> Copy Email
                        </button>
                        <button class="dropdown-option send-option" 
                            data-email="${secondEmail}" 
                            data-name="${person.fullName}"
                            data-person-position="${personPosition}"
                            data-job-position="${currentJobInfo ? currentJobInfo.position : ''}">
                            <i class="fas fa-paper-plane"></i> Send Email
                        </button>
                    </div>
                    ` : ''}
                </div>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Dropdown interactions and copy functionality
    document.querySelectorAll('.email-text').forEach(emailText => {
        emailText.addEventListener('click', (e) => {
            e.stopPropagation();
            closeAllDropdowns();
            const dropdown = emailText.nextElementSibling;
            const rect = emailText.getBoundingClientRect();
            dropdown.style.top = `${rect.bottom + window.scrollY}px`;
            dropdown.style.left = `${rect.left}px`;
            dropdown.style.width = `${rect.width}px`;
            dropdown.classList.add('active');
        });
    });

    document.querySelectorAll('.copy-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const email = option.dataset.email;
            if (email && email !== "-") {
                copyToClipboard(email);
                showNotification(`Copied email:\n${email}`);
            }
            option.closest('.email-dropdown').classList.remove('active');
        });
    });

    document.addEventListener('click', closeAllDropdowns);
}

/* ---------------------------
   Notification & Copy Helpers
--------------------------- */
function showNotification(message, type = 'info') {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    notification.setAttribute('data-type', type);
    switch(type) {
        case 'error':
            notification.style.backgroundColor = 'rgba(220, 53, 69, 0.9)';
            break;
        case 'success':
            notification.style.backgroundColor = 'rgba(40, 167, 69, 0.9)';
            break;
        case 'info':
            notification.style.backgroundColor = 'rgba(0, 123, 255, 0.9)';
            break;
    }
    notification.style.display = 'block';
    notification.style.animation = 'none';
    notification.offsetHeight; // Trigger reflow
    notification.style.animation = 'fadeInOut 3s ease-in-out';
    setTimeout(() => {
        notification.style.display = "none";
    }, 3000);
}

function copyToClipboard(text) {
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

/* ---------------------------
   Loading Animation
--------------------------- */
const loadingMessages = [
    "🔍 Searching for contacts...",
    "🌐 Connecting the dots...",
    "✨ Finding the right people...",
    "📊 Processing data...",
    "🎯 Almost there...",
    "🤝 Getting ready to connect..."
];

function startLoadingAnimation(companyName = '') {
    const loadingText = document.getElementById("loadingText");
    let currentIndex = 0;
    if (companyName) {
        const companyHeader = document.getElementById("companyHeader");
        companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${companyName}</span>`;
        companyHeader.style.display = "block";
    }
    loadingText.style.opacity = "0";
    setTimeout(() => {
        loadingText.textContent = loadingMessages[0];
        loadingText.style.opacity = "1";
    }, 300);
    messageInterval = setInterval(() => {
        loadingText.style.opacity = "0";
        setTimeout(() => {
            currentIndex = (currentIndex + 1) % loadingMessages.length;
            loadingText.textContent = loadingMessages[currentIndex];
            loadingText.style.opacity = "1";
        }, 300);
    }, 2000);
}

function stopLoadingAnimation() {
    if (messageInterval) {
        clearInterval(messageInterval);
        messageInterval = null;
    }
}

/* ---------------------------
   Fetch People (Triggered by Button/Enter)
--------------------------- */
async function fetchPeople() {
    const companyName = document.getElementById("companyInput").value.trim();
    const tableBody = document.querySelector("#resultsTable tbody");
    const loadingMessage = document.getElementById("loadingMessage");
    const inputField = document.getElementById("companyInput");
    const searchButton = document.getElementById("sendRequest");
    const responseContainer = document.getElementById("responseContainer");
    const companyHeader = document.getElementById("companyHeader");

    if (!companyName) {
        tableBody.innerHTML = "<tr><td colspan='4' style='color: red;'>Please enter a company name.</td></tr>";
        companyHeader.style.display = "none";
        return;
    }

    loadingMessage.style.display = "flex";
    responseContainer.style.display = "none";
    tableBody.innerHTML = "";
    inputField.disabled = true;
    searchButton.disabled = true;
    startLoadingAnimation(companyName);

    try {
        const response = await fetch(`${BASE_URL}/getPeople`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyName })
        });

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const data = await response.json();

        if (!data || !data.data || data.data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4' style='color: yellow;'>No results found.</td></tr>";
            return;
        }

        await saveToStorage(data.data, companyName);
        companyHeader.innerHTML = `<span class="results-text">Results for:</span> <span class="company-name">${companyName}</span>`;
        companyHeader.style.display = "block";
        displayResults(data.data);
        responseContainer.style.display = "block";
    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = "<tr><td colspan='4' style='color: red;'>Failed to fetch data.</td></tr>";
        companyHeader.style.display = "none";
    } finally {
        stopLoadingAnimation();
        loadingMessage.style.display = "none";
        responseContainer.style.display = "block";
        inputField.disabled = false;
        searchButton.disabled = false;
        inputField.value = "";
    }
}

/* ---------------------------
   Send Email
--------------------------- */
async function sendEmail(emailData) {
    try {
        // Show initial notification with loading state
        const positionDisplay = emailData.position || 'N/A';
        showNotification(`📧 Sending email request...\nTo: ${emailData.recipientName}\nPosition: ${positionDisplay}`, 'info');
        
        // Close dropdown
        closeAllDropdowns();

        // Get job description HTML if we're on a LinkedIn job page and have a jobId
        let jobDescriptionHtml = null;
        if (emailData.jobId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        let jobDescriptionHtml = null;
                        const jobDescriptionSelectors = [
                            '.jobs-description__content',
                            '.jobs-box--fadein.jobs-description',
                            '#job-details',
                            '.jobs-description-content__text--stretch'
                        ];
                        
                        for (const selector of jobDescriptionSelectors) {
                            const element = document.querySelector(selector);
                            if (element) {
                                jobDescriptionHtml = element.outerHTML;
                                break;
                            }
                        }
                        
                        if (!jobDescriptionHtml) {
                            const articleElement = document.querySelector('article.jobs-description__container');
                            if (articleElement) {
                                jobDescriptionHtml = articleElement.outerHTML;
                            }
                        }
                        
                        return jobDescriptionHtml;
                    }
                });
                jobDescriptionHtml = results[0].result;
            }
        } else if (currentJobInfo && currentJobInfo.jobDescriptionHtml) {
            jobDescriptionHtml = currentJobInfo.jobDescriptionHtml;
        }

        // Prepare request data without the recipientPosition parameter
        const requestData = {
            recipientEmail: emailData.recipientEmail,
            recipientName: emailData.recipientName,
            position: emailData.position || '',
            companyName: emailData.companyName || document.querySelector('#companyHeader .company-name')?.textContent?.trim() || '',
            jobId: emailData.jobId || null,
            jobDescriptionHtml: jobDescriptionHtml
        };

        console.log("Sending email with data:", requestData);

        const response = await fetch(`${BASE_URL}/sendEmail`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            throw new Error(errorData?.message || `Failed to queue email (${response.status})`);
        }

        const data = await response.json();
        showNotification(`✅ Email queued successfully!\nTo: ${emailData.recipientName}\nPosition: ${positionDisplay}`, 'success');
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        showNotification(`❌ Error sending email\nTo: ${emailData.recipientName}\nError: ${error.message}`, 'error');
        throw error;
    }
}


/* ---------------------------
   Dropdown Helpers
--------------------------- */
function closeAllDropdowns() {
    document.querySelectorAll('.email-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
    });
}

// Event listener for send email option clicks
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('send-option')) {
        e.stopPropagation();
        const option = e.target;
        const email = option.dataset.email;
        const name = option.dataset.name;
        const personPosition = option.dataset.personPosition;
        const jobPosition = option.dataset.jobPosition;
        const companyName = document.querySelector('#companyHeader .company-name')?.textContent?.trim();

        let jobId = null;
        let jobDescriptionHtml = null;
        if (currentJobInfo) {
            jobId = currentJobInfo.jobId || null;
            jobDescriptionHtml = currentJobInfo.jobDescriptionHtml || null;
        }

        if (email && email !== "-") {
            try {
                const emailData = {
                    recipientEmail: email,
                    recipientName: name,
                    recipientPosition: personPosition,
                    position: jobPosition || (currentJobInfo ? currentJobInfo.position : ''),
                    companyName: companyName,
                    jobId: jobId,
                    jobDescriptionHtml: jobDescriptionHtml
                };
                
                await sendEmail(emailData);
            } catch (error) {
                console.error('Failed to send email:', error);
            }
        }
        
        closeAllDropdowns();
    }
});

// Event listeners for button and input field
document.getElementById("sendRequest").addEventListener("click", fetchPeople);
document.getElementById("companyInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        fetchPeople();
    }
});

// Load previous results on popup open
document.addEventListener('DOMContentLoaded', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const isLinkedInJobPage = tab.url.startsWith('https://www.linkedin.com/jobs/view/');
    updateStatusIndicators(isLinkedInJobPage);
    loadPreviousResults();
});
