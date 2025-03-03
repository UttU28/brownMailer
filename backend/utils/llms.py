import ollama
import openai
import os
import time
from colorama import Fore, Style

openAiApiKey = os.getenv('OPENAI_API_KEY')


def callOllama(sysPrompt, userPrompt):
    print(Fore.BLUE + "Calling Ollama model..." + Style.RESET_ALL)
    start_time = time.time()
    
    response = ollama.chat(
        model='llama3.2', 
        messages=[
            {"role": "system", "content": sysPrompt},
            {"role": "user", "content": userPrompt}
        ],
        options={
            "temperature": 0.0,
            "top_p": 1.0,
            "frequency_penalty": 0.0,
            "presence_penalty": 0.0
        }
    )
    
    end_time = time.time()
    print(Fore.GREEN + f"Response generated in {end_time - start_time:.2f} seconds" + Style.RESET_ALL)
    return response['message']['content'].strip()


def callOpenAI(sysPrompt, userPrompt):
    print(Fore.BLUE + "Calling OpenAI model..." + Style.RESET_ALL)
    start_time = time.time()
    
    openai.api_key = openAiApiKey
    response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": sysPrompt},
            {"role": "user", "content": userPrompt}
        ],
        temperature=0.0,
        top_p=1.0,
        frequency_penalty=0.0,
        presence_penalty=0.0
    )
    
    end_time = time.time()
    print(Fore.GREEN + f"Response generated in {end_time - start_time:.2f} seconds" + Style.RESET_ALL)
    return response.choices[0].message.content.strip()