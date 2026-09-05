"""Vercel entrypoint for the FastAPI AI service."""

import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parents[1] / 'python-backend'
sys.path.insert(0, str(backend_dir))

from app import app  # noqa: E402
