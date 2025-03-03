// Base URL for API calls
const BASE_URL = 'http://localhost:3000';

document.getElementById("sendRequest").addEventListener("click", fetchPeople);
document.getElementById("companyInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        fetchPeople();
    }
});

// Load previous results when popup opens
document.addEventListener('DOMContentLoaded', loadPreviousResults);

async function loadPreviousResults() {
    const responseContainer = document.getElementById("responseContainer");
    const companyHeader = document.getElementById("companyHeader");
    const inputContainer = document.querySelector('.input-container');
    const loadingMessage = document.getElementById("loadingMessage");
    const companyInput = document.getElementById("companyInput");

    try {
        // Check if we're on a LinkedIn job page
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
            // Keep the input container visible
            inputContainer.style.display = 'flex';

            // Get company name immediately
            const companyInfo = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
                    return companyElement ? companyElement.textContent.trim() : null;
                }
            });

            const companyName = companyInfo[0].result;
            if (companyName) {
                // Set company name in input field
                companyInput.value = companyName;
                
                // Show loading state with company name immediately
                companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${companyName}</span>`;
                companyHeader.style.display = "block";
                loadingMessage.style.display = "flex";
                startLoadingAnimation(companyName);
            }

            // Auto-trigger search
            await searchFromJobPage(tab);
        } else {
            // Show previous results if they exist
            const result = await chrome.storage.local.get(['lastSearchResults', 'lastCompanyName']);
            if (result.lastSearchResults && result.lastSearchResults.length > 0) {
                responseContainer.style.display = "block";
                companyInput.value = ""; // Keep input empty when not on LinkedIn jobs page
                
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

async function searchFromJobPage(tab) {
    try {
        // Execute script to get company info and job description HTML from the page
        const results = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const companyElement = document.querySelector('.job-details-jobs-unified-top-card__company-name a');
                const positionElement = document.querySelector('.job-details-jobs-unified-top-card__job-title h1');
                const applyButton = document.querySelector('.jobs-apply-button');
                const jobDescriptionElement = document.querySelector('.jobs-description__content');

                return {
                    companyName: companyElement ? companyElement.textContent.trim() : null,
                    position: positionElement ? positionElement.textContent.trim() : '',
                    jobId: applyButton ? applyButton.getAttribute('data-job-id') : '',
                    jobDescriptionHtml: jobDescriptionElement ? jobDescriptionElement.outerHTML : null
                };
            }
        });

        const { companyName, position, jobId, jobDescriptionHtml } = results[0].result;
        if (!companyName) {
            throw new Error('Could not find company name on the page');
        }

        // Show loading and company name
        const loadingMessage = document.getElementById("loadingMessage");
        const responseContainer = document.getElementById("responseContainer");
        const companyHeader = document.getElementById("companyHeader");
        const companyInput = document.getElementById("companyInput");

        // Set company name in input field during loading
        companyInput.value = companyName;
        
        loadingMessage.style.display = "flex";
        responseContainer.style.display = "none";
        
        // Update company header immediately
        companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${companyName}</span>`;
        companyHeader.style.display = "block";
        
        // Start loading animation
        startLoadingAnimation(companyName);

        // Make the API request with job description HTML
        const response = await fetch(`${BASE_URL}/getPeople`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                companyName, 
                position, 
                jobId,
                jobDescriptionHtml 
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }

        const data = await response.json();
        await saveToStorage(data.data, companyName);
        
        // Update UI
        companyHeader.innerHTML = `<span class="results-text">Results for:</span> <span class="company-name">${companyName}</span>`;
        displayResults(data.data);
        responseContainer.style.display = "block";
        
        // Clear input after loading is complete
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

async function saveToStorage(data, companyName) {
    try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
            await chrome.storage.local.set({
                lastSearchResults: data,
                lastCompanyName: companyName
            });
        }
    } catch (error) {
        console.error("Error saving to storage:", error);
    }
}

function displayResults(data) {
    const tableBody = document.querySelector("#resultsTable tbody");
    tableBody.innerHTML = "";

    // Add notification div if it doesn't exist
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

    // Store job info for later use
    let currentJobInfo = null;

    // Check if we're on LinkedIn jobs page and get job info
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        const tab = tabs[0];
        if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
            const jobInfoResult = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                func: () => {
                    const positionElement = document.querySelector('.job-details-jobs-unified-top-card__job-title h1');
                    const applyButton = document.querySelector('.jobs-apply-button');
                    return {
                        position: positionElement ? positionElement.textContent.trim() : '',
                        jobId: applyButton ? applyButton.getAttribute('data-job-id') : ''
                    };
                }
            });
            currentJobInfo = jobInfoResult[0].result;
        }
    });

    data.forEach(person => {
        const firstEmail = person.emails.length > 0 ? person.emails[0] : "No email available";
        const position = person.position || "No position listed";
        const linkedinURL = person.linkedin || "#";
        
        // Extract domain from email
        const emailDomain = firstEmail !== "No email available" ? firstEmail.split('@')[1] : "No email available";

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>
                <a href="${linkedinURL}" target="_blank" class="name-with-linkedin" title="View LinkedIn Profile">
                    <i class="fab fa-linkedin"></i>
                    <span class="name-text">${person.fullName}</span>
                </a>
            </td>
            <td class="position">${position}</td>
            <td>
                <div class="email-text" title="${firstEmail}">@${emailDomain}</div>
            </td>
            <td>
                <div class="send-btn" data-email="${firstEmail}" data-name="${person.fullName}" title="Send Email">
                    <i class="fas fa-envelope"></i>
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Add click handlers for email copying
    document.querySelectorAll(".email-text").forEach(emailDiv => {
        emailDiv.addEventListener("click", () => {
            const email = emailDiv.getAttribute("title"); // Use full email from title attribute
            copyToClipboard(email);
            showNotification("Email copied to clipboard!");
        });
    });

    // Add click handlers for send email buttons
    document.querySelectorAll(".send-btn").forEach(button => {
        button.addEventListener("click", async () => {
            const email = button.getAttribute("data-email");
            const name = button.getAttribute("data-name");
            if (email && email !== "No email available") {
                await sendEmail(email, name, currentJobInfo);
            }
        });
    });
}

function showNotification(message) {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    notification.style.display = 'block';
    
    // Reset animation
    notification.style.animation = 'none';
    notification.offsetHeight; // Trigger reflow
    notification.style.animation = 'fadeInOut 2s ease-in-out';

    // Hide notification after animation
    setTimeout(() => {
        notification.style.display = 'none';
    }, 2000);
}

function copyToClipboard(text) {
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

// Add loading message cycling
const loadingMessages = [
    "🔍 Searching for contacts...",
    "🌐 Connecting the dots...",
    "✨ Finding the right people...",
    "📊 Processing data...",
    "🎯 Almost there...",
    "🤝 Getting ready to connect..."
];

let messageInterval;

function startLoadingAnimation(companyName = '') {
    const loadingText = document.getElementById("loadingText");
    let currentIndex = 0;

    // Show company name if provided
    if (companyName) {
        const companyHeader = document.getElementById("companyHeader");
        companyHeader.innerHTML = `<span class="results-text">Searching:</span> <span class="company-name">${companyName}</span>`;
        companyHeader.style.display = "block";
    }

    // Initial message
    loadingText.style.opacity = "0";
    setTimeout(() => {
        loadingText.textContent = loadingMessages[0];
        loadingText.style.opacity = "1";
    }, 300);

    // Cycle through messages
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

    // Show loading and start animation
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
        // Clear the input field only after loading is complete
        inputField.value = "";
    }
}

// Update sendEmail function to include job description HTML
async function sendEmail(email, name, jobInfo = null) {
    if (!email || !name) {
        showNotification("Error: Name and email are required");
        return;
    }

    try {
        // Get company name from the header
        const companyHeader = document.getElementById("companyHeader");
        const companyNameElement = companyHeader.querySelector(".company-name");
        const companyName = companyNameElement ? companyNameElement.textContent.trim() : null;

        const payload = { 
            email,
            name,
            companyName 
        };

        // If we have job info, get the job description HTML
        if (jobInfo && jobInfo.position) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        const jobDescriptionElement = document.querySelector('.jobs-description__content');
                        return jobDescriptionElement ? jobDescriptionElement.outerHTML : null;
                    }
                });
                payload.jobDescriptionHtml = results[0].result;
            }
            
            payload.position = jobInfo.position;
            payload.jobId = jobInfo.jobId;
        }

        let notificationMessage = `Added to email queue:\nName: ${name}\nEmail: ${email}\nCompany: ${companyName}`;
        if (jobInfo && jobInfo.position) {
            notificationMessage += `\nPosition: ${jobInfo.position}`;
        }

        const response = await fetch(`${BASE_URL}/sendEmail`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            showNotification(notificationMessage);
        } else {
            showNotification(`Failed to queue email: ${data.message || 'Unknown error'}`);
        }
    } catch (error) {
        console.error("Error sending email:", error);
        showNotification("Error connecting to email service");
    }
}
