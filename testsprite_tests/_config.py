"""Test credentials - set via environment variables or testsprite_tests/.env. Never commit real values."""
import os

# Load .env from this directory if it exists (no extra deps)
_env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(_env_path):
    with open(_env_path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                k, v = k.strip(), v.strip().strip('"').strip("'")
                os.environ.setdefault(k, v)

TEST_EMAIL = os.environ.get("CULTIF_TEST_EMAIL", "")
TEST_PASSWORD = os.environ.get("CULTIF_TEST_PASSWORD", "")
