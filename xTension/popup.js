document.getElementById("sendRequest").addEventListener("click", fetchPeople);
document.getElementById("companyInput").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        fetchPeople();
    }
});

async function fetchPeople() {
    const companyName = document.getElementById("companyInput").value.trim();
    const tableBody = document.querySelector("#resultsTable tbody");
    const loadingMessage = document.getElementById("loadingMessage");
    const loadingText = document.getElementById("loadingText");
    const inputField = document.getElementById("companyInput");
    const searchButton = document.getElementById("sendRequest");
    const responseContainer = document.getElementById("responseContainer");

    if (!companyName) {
        tableBody.innerHTML = "<tr><td colspan='5' style='color: red;'>Please enter a company name.</td></tr>";
        return;
    }

    // Show loading only while fetching
    loadingMessage.style.display = "flex";  // Show loader
    responseContainer.style.display = "none"; // Hide table
    tableBody.innerHTML = ""; // Clear old results
    inputField.disabled = true;
    searchButton.disabled = true;

    // Loading text updates (simulates backend steps)
    const loadingSteps = [
        "Fetching people from company: " + companyName,
        "Performing Google Search...",
        "✔ Google Search completed successfully!",
        "Cleaning search results...",
        "✔ Search results cleaned successfully!",
        "Converting results to Markdown format...",
        "✔ Markdown conversion completed!",
        "Extracting data from Markdown...",
        "✔ Data extracted successfully!",
        "Fetching emails from SalesQL...",
        "✔ Fetching from SalesQL completed!",
        "Saving data to JSON file...",
        "✔ Data saved successfully!",
        "✔ Process completed successfully!"
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
        if (stepIndex < loadingSteps.length) {
            loadingText.innerHTML = loadingSteps[stepIndex];
            stepIndex++;
        }
    }, 1000); // Change text every 1 second

    try {
        const response = await fetch("http://localhost:3000/getPeople", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ companyName })
        });

        if (!response.ok) {
            throw new Error("Server returned an error");
        }

        const data = await response.json();

        clearInterval(stepInterval); // Stop loading text updates once request is done

        if (!data || !data.data || data.data.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='5' style='color: yellow;'>No results found.</td></tr>";
            return;
        }

        // Populate the table
        data.data.forEach(person => {
            const firstEmail = person.emails.length > 0 ? person.emails[0] : "No email available";
            const position = person.position || "No position listed";
            const linkedinURL = person.linkedin || "#";

            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${person.fullName}</td>
                <td class="position">${position}</td>
                <td>
                    <a href="${linkedinURL}" target="_blank">
                        <img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" class="linkedin-icon">
                    </a>
                </td>
                <td>
                    <button class="copy-btn" data-email="${firstEmail}">Copy</button>
                </td>
                <td>
                    <button class="send-btn" data-email="${firstEmail}">Send Email</button>
                </td>
            `;

            tableBody.appendChild(row);
        });

    } catch (error) {
        console.error("Error:", error);
        tableBody.innerHTML = "<tr><td colspan='5' style='color: red;'>Failed to fetch data.</td></tr>";
    } finally {
        clearInterval(stepInterval); // Ensure interval stops
        loadingMessage.style.display = "none"; // Hide loader
        responseContainer.style.display = "block"; // Show table
        inputField.disabled = false;
        searchButton.disabled = false;
    }
}


// Function to copy email to clipboard
function copyToClipboard(text) {
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = text;
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
}

// Function to send email via POST request
async function sendEmail(email) {
    try {
        const response = await fetch("http://localhost:3000/sendEmail", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            alert("Email sent successfully!");
        } else {
            alert("Failed to send email.");
        }
    } catch (error) {
        console.error("Error sending email:", error);
        alert("Error sending email.");
    }
}
