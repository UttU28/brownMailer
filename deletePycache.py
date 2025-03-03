# deletePycache.py

import os
import shutil
from tqdm import tqdm
from colorama import Fore, Style

def deletePycache(rootDir="."):
    """
    Thank me later.
    Delete all __pycache__ directories and their contents recursively starting from the root directory.
    
    __pycache__ directories contain compiled Python bytecode (.pyc files) that Python creates
    to optimize import speed. While useful during runtime, these can:
    - Take up unnecessary disk space
    - Cause version conflicts between Python versions
    - Lead to stale bytecode if source files are modified
    - Create unnecessary files in version control
    
    Args:
        rootDir (str): The root directory to start searching from. Defaults to current directory.
    """
    pycacheDirs = []
    
    for dirpath, dirnames, _ in os.walk(rootDir):
        if "__pycache__" in dirnames:
            pycacheDirs.append(os.path.join(dirpath, "__pycache__"))

    if not pycacheDirs:
        print(Fore.YELLOW + "✅ No __pycache__ directories found. Your project is already clean!" + Style.RESET_ALL)
        return

    print(Fore.CYAN + "🔍 Cleaning up __pycache__ directories..." + Style.RESET_ALL)

    for pycachePath in tqdm(pycacheDirs, desc="🗑️ Deleting", unit="dir", dynamic_ncols=True, colour="green"):
        try:
            shutil.rmtree(pycachePath)
        except Exception as e:
            print(Fore.RED + f"\n❌ Failed to delete {pycachePath}: {e}" + Style.RESET_ALL)

    print(Fore.GREEN + "\n🚀 Cleanup complete! Your project is fresh and fast!" + Style.RESET_ALL)

if __name__ == "__main__":
    deletePycache()
