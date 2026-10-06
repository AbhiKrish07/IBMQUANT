"""Compatibility launcher for the single Q-UPI Sentinel backend.

The project previously contained both a FastAPI service and a Flask service,
with incompatible URLs and ports. The canonical application is now
``unified_app:app``; keeping this module prevents old launch commands from
bringing up a second, incomplete API.
"""

import os

from unified_app import app


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "8002")), debug=False)
