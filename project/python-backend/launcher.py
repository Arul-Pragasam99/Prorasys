import subprocess
import sys
import os
import time
import webbrowser
import threading

def run_nextjs():
    """Run Next.js dev server"""
    print("🚀 Starting Next.js...")
    subprocess.Popen(["npm", "run", "dev"], shell=True)

def run_python():
    """Run Python AI service"""
    print("🐍 Starting Python AI service...")
    subprocess.Popen([sys.executable, "app.py"], shell=True)

def open_browser():
    """Open browser after services start"""
    time.sleep(5)
    webbrowser.open("http://localhost:3000")

if __name__ == "__main__":
    print("=" * 50)
    print("🚀 Starting Prorasys E-Commerce Platform")
    print("=" * 50)
    print("📦 Next.js: http://localhost:3000")
    print("🐍 Python AI: http://localhost:8000")
    print("=" * 50)
    
    # Start Next.js in background
    threading.Thread(target=run_nextjs, daemon=True).start()
    
    # Start Python in background
    threading.Thread(target=run_python, daemon=True).start()
    
    # Open browser
    threading.Thread(target=open_browser, daemon=True).start()
    
    # Keep the script running
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 Shutting down services...")
        sys.exit(0)