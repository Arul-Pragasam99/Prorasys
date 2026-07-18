#!/usr/bin/env python3
"""
Prorasys E-Commerce Platform Launcher
Starts both Next.js and Python AI services
"""

import subprocess
import sys
import os
import time
import threading
import signal
import platform

class ServiceLauncher:
    def __init__(self):
        self.processes = []
        self.running = True
        self.base_dir = os.path.dirname(os.path.abspath(__file__))
        
    def print_header(self):
        print("=" * 60)
        print("  PRORASYS E-COMMERCE PLATFORM")
        print("=" * 60)
        print("  Next.js:   http://localhost:3000")
        print("  Python AI: http://localhost:8000")
        print("=" * 60)
        print()
        
    def start_nextjs(self):
        """Start Next.js development server"""
        print("[Next.js] Starting...")
        try:
            env = os.environ.copy()
            env["PYTHONIOENCODING"] = "utf-8"
            env["PYTHONUTF8"] = "1"
            
            process = subprocess.Popen(
                ["npm", "run", "dev"],
                cwd=self.base_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env
            )
            self.processes.append(process)
            
            # Read output safely
            if process.stdout:
                for line in process.stdout:
                    if "ready" in line.lower():
                        print(f"[Next.js] READY: {line.strip()}")
                    elif "error" in line.lower():
                        print(f"[Next.js] ERROR: {line.strip()}")
                    else:
                        if "compiling" not in line.lower() and "waiting" not in line.lower():
                            print(f"[Next.js] {line.strip()}")
                    
        except Exception as e:
            print(f"[Next.js] FAILED: {e}")
            
    def start_python(self):
        """Start Python AI service"""
        print("[Python] Starting...")
        
        python_cmd = "python"
        if platform.system() == "Windows":
            venv_path = os.path.join(self.base_dir, "python-backend", "venv", "Scripts", "python.exe")
            if os.path.exists(venv_path):
                python_cmd = venv_path
        else:
            venv_path = os.path.join(self.base_dir, "python-backend", "venv", "bin", "python")
            if os.path.exists(venv_path):
                python_cmd = venv_path
        
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        env["PYTHONUTF8"] = "1"
                
        try:
            process = subprocess.Popen(
                [python_cmd, "app.py"],
                cwd=os.path.join(self.base_dir, "python-backend"),
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env
            )
            self.processes.append(process)
            
            # Read output safely
            if process.stdout:
                for line in process.stdout:
                    if "running" in line.lower() or "started" in line.lower():
                        print(f"[Python] READY: {line.strip()}")
                    elif "error" in line.lower():
                        print(f"[Python] ERROR: {line.strip()}")
                    else:
                        print(f"[Python] {line.strip()}")
                    
        except Exception as e:
            print(f"[Python] FAILED: {e}")
            
    def open_browser(self):
        """Open browser after services start"""
        time.sleep(8)
        try:
            import webbrowser
            webbrowser.open("http://localhost:3000")
            print("[Browser] Opened: http://localhost:3000")
        except:
            print("[Browser] Please open: http://localhost:3000")
            
    def signal_handler(self, signum, frame):
        """Handle Ctrl+C gracefully"""
        print("\n[System] Shutting down services...")
        self.running = False
        for process in self.processes:
            try:
                process.terminate()
                process.wait(timeout=3)
            except:
                try:
                    process.kill()
                except:
                    pass
        print("[System] All services stopped!")
        sys.exit(0)
        
    def run(self):
        """Main launcher"""
        self.print_header()
        
        signal.signal(signal.SIGINT, self.signal_handler)
        signal.signal(signal.SIGTERM, self.signal_handler)
        
        self.start_python()
        time.sleep(3)
        self.start_nextjs()
        
        threading.Thread(target=self.open_browser, daemon=True).start()
        
        print()
        print("[System] All services started!")
        print("[System] Press Ctrl+C to stop all services...")
        print()
        
        try:
            while self.running:
                time.sleep(1)
                for process in self.processes:
                    if process.poll() is not None:
                        print("[System] A service stopped unexpectedly.")
                        self.running = False
                        break
        except KeyboardInterrupt:
            self.signal_handler(None, None)

if __name__ == "__main__":
    launcher = ServiceLauncher()
    launcher.run()