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
        const firstEmail = person.emails.length > 0 && person.emails[0] !== "undefined" ? person.emails[0] : "-";
        const secondEmail = person.emails.length > 1 && person.emails[1] !== "undefined" ? person.emails[1] : "-";
        const position = person.position || "No position listed";
        const linkedinURL = person.linkedin || "#";
        
        // Extract domains
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
            <td class="position" title="${position}">${position}</td>
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
                            data-position="${position}">
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
                            data-position="${position}">
                            <i class="fas fa-paper-plane"></i> Send Email
                        </button>
                    </div>
                    ` : ''}
                </div>
            </td>
        `;

        tableBody.appendChild(row);
    });

    // Handle email text clicks to show dropdown
    document.querySelectorAll('.email-text').forEach(emailText => {
        emailText.addEventListener('click', (e) => {
            e.stopPropagation();
            // Close all other dropdowns
            document.querySelectorAll('.email-dropdown').forEach(dropdown => {
                dropdown.classList.remove('active');
                dropdown.style.top = '';
                dropdown.style.left = '';
                dropdown.style.width = '';
            });

            // Show and position this dropdown
            const dropdown = emailText.nextElementSibling;
            const rect = emailText.getBoundingClientRect();
            
            // Calculate position
            const top = rect.bottom + window.scrollY;
            const left = rect.left;
            
            // Position the dropdown
            dropdown.style.top = `${top}px`;
            dropdown.style.left = `${left}px`;
            dropdown.style.width = `${rect.width}px`;
            
            // Show the dropdown
            dropdown.classList.add('active');
        });
    });

    // Handle copy option clicks
    document.querySelectorAll('.copy-option').forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            const email = option.dataset.email;
            if (email && email !== "-") {
                copyToClipboard(email);
                showNotification(`Copied email:\n${email}`);
            }
            // Close dropdown
            option.closest('.email-dropdown').classList.remove('active');
        });
    });

    // Handle send option clicks
    document.querySelectorAll('.send-option').forEach(option => {
        option.addEventListener('click', async (e) => {
            e.stopPropagation();
            const email = option.dataset.email;
            const name = option.dataset.name;
            const position = option.dataset.position;

            if (email && email !== "-") {
                const emailData = {
                    recipientEmail: email,
                    recipientName: name,
                    position: position,
                    companyName: document.querySelector('#companyHeader .company-name')?.textContent || '',
                    jobInfo: currentJobInfo || {}
                };
                
                await sendEmail(emailData);
            }
            // Close dropdown
            option.closest('.email-dropdown').classList.remove('active');
        });
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.email-dropdown').forEach(dropdown => {
            dropdown.classList.remove('active');
        });
    });
}

function showNotification(message, type = 'info') {
    const notification = document.querySelector('.notification');
    notification.textContent = message;
    
    // Set notification type
    notification.setAttribute('data-type', type);
    
    // Set background color based on type
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
    
    // Reset animation
    notification.style.animation = 'none';
    notification.offsetHeight; // Trigger reflow
    notification.style.animation = 'fadeInOut 3s ease-in-out';

    // Hide notification after animation
    setTimeout(() => {
        notification.style.display = 'none';
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

// Update sendEmail function to handle new parameter structure
async function sendEmail(emailData) {
    try {
        // Show initial notification with loading state
        showNotification(`📧 Sending email request...\nTo: ${emailData.recipientName}\nPosition: ${emailData.position || 'N/A'}`, 'info');
        
        // Close dropdown
        closeAllDropdowns();

        // Get job description HTML if we're on a LinkedIn job page
        if (emailData.jobInfo && emailData.jobInfo.jobId) {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab.url.startsWith('https://www.linkedin.com/jobs/view/')) {
                const results = await chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: () => {
                        const jobDescriptionElement = document.querySelector('.jobs-description__content');
                        return jobDescriptionElement ? jobDescriptionElement.outerHTML : null;
                    }
                });
                emailData.jobInfo.jobDescriptionHtml = results[0].result;
            }
        }

        // Ensure all required fields are present
        const requestData = {
            recipientEmail: emailData.recipientEmail,
            recipientName: emailData.recipientName,
            companyName: emailData.companyName || document.querySelector('#companyHeader .company-name')?.textContent?.trim() || '',
            position: emailData.position || '',
            jobInfo: emailData.jobInfo || {}
        };

        console.log('Sending email request:', requestData);

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
        // Show success notification
        showNotification(`✅ Email queued successfully!\nTo: ${emailData.recipientName}\nPosition: ${emailData.position || 'N/A'}`, 'success');
        return data;
    } catch (error) {
        console.error("Error sending email:", error);
        showNotification(`❌ Error sending email\nTo: ${emailData.recipientName}\nError: ${error.message}`, 'error');
        throw error;
    }
}

// Helper function to close all dropdowns
function closeAllDropdowns() {
    document.querySelectorAll('.email-dropdown').forEach(dropdown => {
        dropdown.classList.remove('active');
        dropdown.style.top = '';
        dropdown.style.left = '';
        dropdown.style.width = '';
    });
}

// Update the send option click handler
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('send-option')) {
        e.stopPropagation();
        const option = e.target;
        const email = option.dataset.email;
        const name = option.dataset.name;
        const position = option.dataset.position;
        const companyName = document.querySelector('#companyHeader .company-name')?.textContent?.trim();

        if (email && email !== "-") {
            try {
                const emailData = {
                    recipientEmail: email,
                    recipientName: name,
                    position: position,
                    companyName: companyName,
                    jobInfo: {
                        jobId: null,
                        positionName: position,
                        companyName: companyName
                    }
                };
                
                await sendEmail(emailData);
            } catch (error) {
                console.error('Failed to send email:', error);
            }
        }
        
        // Close dropdown
        closeAllDropdowns();
    }
});
