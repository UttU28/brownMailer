MKD_EXTRACTION_PROMPT = r"""
    You are an AI assistant that extracts structured data **ONLY** from the provided Markdown content. Your task is to extract details for all **explicitly mentioned** individuals.

    ---

    ### **TASK**  
    Extract the following details for each person:
    - **Full Name**  
    - **Position**  
    - **Company**  
    - **LinkedIn URL**  
    - **Other URLs**  

    ### **STRICT INSTRUCTIONS**  
    1. **Only return individuals explicitly named in the Markdown content.**  
    2. **DO NOT** assume, infer, or hallucinate any details. **Extract only what is explicitly written.**  
    3. **If a field is missing, return `""` (empty string) or `[]` for URLs.**  
    4. **Ensure the output format is a valid JSON array.**  
    5. **Use only the data found in the Markdown text.**  
    6. **Do not modify names, roles, or links. Preserve exact values.**  
    7. **Follow the JSON format strictly—no extra fields, no missing fields.**  

    ---

    ### **Markdown Content:**  
    {markdownText}  

    ---

    ### **EXPECTED JSON OUTPUT FORMAT**  
    ```json
    [
        {{
            "fullName": "John Doe",
            "position": "Software Engineer",
            "company": "Entegris",
            "linkedin": "https://linkedin.com/in/johndoe",
            "otherUrls": ["https://johndoe.dev"]
        }},
        {{
            "fullName": "Jane Smith",
            "position": "Product Manager",
            "company": "Workforce",
            "linkedin": "https://linkedin.com/in/janesmith",
            "otherUrls": []
        }}
    ]
    ```

    ---

    ### **EXAMPLES TO FOLLOW**  
    ✔ **Correct Output:**  
    - `"fullName": "John Doe"` → Found in Markdown  
    - `"position": "Software Engineer"` → Found in Markdown  
    - `"company": "Entegris"` → Found in Markdown  
    - `"linkedin": "https://linkedin.com/in/johndoe"` → Found in Markdown  
    - `"otherUrls": ["https://johndoe.dev"]` → Found in Markdown  

    ✘ **Incorrect Output:**  
    - `"fullName": "Invented Name"` → ✘ Not found in Markdown  
    - `"position": "Assumed Role"` → ✘ Not explicitly stated  
    - `"company": "Assumed Company Name"` → ✘ If missing, return `""`  
    - `"linkedin": "https://linkedin.com/in/random"` → ✘ If missing, return `""`  
    - `"otherUrls": ["https://fakewebsite.com"]` → ✘ If missing, return `[]`  

    ---

    ### **FINAL REMINDER**  
    - **STRICTLY EXTRACT ONLY WHAT EXISTS IN MARKDOWN.**  
    - **DO NOT add, infer, assume, or modify any data.**  
    - **RETURN A VALID JSON OUTPUT.**  

    """ 

MKD_COMPACT_PROMPT = r"""
    Extract structured data **ONLY** from the provided Markdown content. **Return linkedin URL details for explicitly named individuals** with the following fields:  

    - **Full Name**  
    - **Position**  
    - **Company**  
    - **LinkedIn URL**  

    ### **Instructions:**  
    1. **Extract only explicitly mentioned names—no assumptions or inferences.**  
    2. **Missing fields must be `""` (empty) or `[]` for URLs.**  
    3. **Preserve exact text without modifications.**  
    4. **Return a valid JSON array strictly matching the format below.**  

    ### **Markdown Content:**  
    {markdownText}  

    ### **Expected JSON Format:**  
    ```json
    [
        {{
            "fullName": "John Doe",
            "position": "Software Engineer",
            "company": "Entegris",
            "linkedin": "https://linkedin.com/in/johndoe",
        }},
        {{
            "fullName": "Jane Smith",
            "position": "Product Manager",
            "company": "Workforce",
            "linkedin": "https://linkedin.com/in/janesmith",
        }}
    ]
    ```

    **⚠️ STRICT RULES:**  
    - **DO NOT infer, assume, or add missing details.**  
    - **Extract only what is explicitly present.**  
    - **No extra fields, no missing fields.**  
    - **Ensure valid JSON output.**  
"""

MKD_SYSTEM_PROMPT = r"""
You are an AI that extracts structured data ONLY from Markdown and returns JSON.
"""




EML_SYSTEM_PROMPT = r"""
You are an AI assistant designed to determine whether a given email domain matches a specified company name. Your goal is to analyze an array of email domains and compare them against a provided company name, returning a corresponding array of 0s and 1s.

### **Guidelines:**
- Perform a **case-insensitive** comparison.
- Extract the core domain name (e.g., "example" from "example.com") and compare it to the company name.
- Return **1** if the domain matches the company name.
- Return **0** otherwise.
- Ensure the output array has the same length as the input array.

### **Output Format:**
Your response should be a JSON array of 0s and 1s. **Do not return any explanations, code, or additional text. Only output the JSON array.**

"""


EML_USER_PROMPT = r"""
You will be given an array of email domains and a company name. Your task is to return an array of the same size, where each element is either 0 or 1.
The input data has total {totalDomains} domains. so the output array should have {totalDomains} elements. The input data is:

```json
{{
  "emailDomains": {domains},
  "companyName": {companyName}
}}
```

### **Matching Criteria:**
- The check should be **case-insensitive**.
- Extract the core domain (excluding ".com", ".org", etc.) and compare it to the company name.
- If the domain matches the company name, return **1**.
- Otherwise, return **0**.



### **Expected Output Format:**
```json
[...]
```

### **Example:**
```json
{{
  "emailDomains": ["tesla.com", "spacex.com", "solarcity.com", "teslamotors.com"],
  "companyName": "tesla"
}}
```

### **Expected Output:**
```json
[1, 0, 0, 1]
```

### **Example 2:**
```json
{{
  "emailDomains": ["google.com", "gmail.com", "yahoo.com", "entegris.co.uk", "aol.com"],
  "companyName": "google"
}}
```

### **Expected Output:**
```json
[1, 0, 0, 0, 0]
```

### **Important Instructions:**
- Your response **must** strictly contain only the JSON array.
- Do **not** return any explanations, code, or additional text.
- Ensure that the system correctly processes the actual input array **{domains}** and company name **{companyName}**.

"""



HLTS_SYSTEM_PROMPT = r"""
You are an AI assistant designed to extract key technical skills required for a given job based on the provided job description. Your goal is to filter out all unnecessary information and return only the relevant technical skills as a comma-separated string.

### Guidelines:
- Perform a **context-aware** extraction of technical skills.
- Ignore company descriptions, job benefits, equal employment opportunity statements, and general job responsibilities.
- Focus on programming languages, frameworks, software tools, methodologies, and specific domain-related expertise.
- Ensure the extracted skills are **accurate and relevant** to the job role.

### Output Format:
Your response should be a **comma-separated string** containing only the extracted technical skills. **Do not return any explanations or additional text.**
"""

HLTS_USER_PROMPT = r"""
You will be given a job description, and your task is to extract only the **technical skills required** for the job. Remove all non-technical information and return only the relevant skills in a comma-separated string.

### **Job Description:**
```json
{{
  "jobDescription": {jobDescription}
}}
```

### **Expected Output Format:**
```text
skill1, skill2, skill3, skill4, ...
```


### **Important Instructions:**
- Your response **must** strictly contain only the comma-separated list of extracted technical skills.
- Do **not** return any explanations, bullet points, or additional text.
"""




VRFY_SYSTEM_PROMPT = r"""
You are an AI assistant designed to verify and refine a given list of technical skills extracted from a job description. Your goal is to check the provided skill list against the job description, ensure that only relevant and mentioned technical skills remain, and **add any missing skills that should be included**.

### Guidelines:
- Cross-check each skill in the provided list against the job description.
- Remove any skills that are **not explicitly mentioned** in the job description.
- **Identify and add any missing skills** that are relevant to the role based on the description.
- Ensure the final output is a **comma-separated string** containing only relevant skills.
- Do not return explanations or extra text—only the cleaned skill list.

### Output Format:
Your response should be a **comma-separated string** containing only the verified and relevant technical skills.
"""

VRFY_USER_PROMPT = r"""
You will be given a **job description** and a **list of extracted technical skills**. Your task is to verify that the extracted skills exist in the job description, **identify any missing relevant skills**, and return only the valid and complete list as a comma-separated string.

### **Inputs:**
```json
{{
  "jobDescription": {jobDescription},
  "highlightSkills": {highlightSkills}
}}
```

### **Expected Output Format:**
```text
skill1, skill2, skill3, skill4, ...
```

### **Important Instructions:**
- Your response **must** strictly contain only the comma-separated list of verified technical skills.
- **Ensure that no relevant skills are omitted.** If any necessary skills are missing, **add them**.
- Do **not** return any explanations, bullet points, or additional text.
"""
