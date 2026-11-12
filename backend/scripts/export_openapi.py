"""Write the API's OpenAPI schema to a file, without starting the server.

Run from the backend folder:
    uv run python -m scripts.export_openapi
"""

import json
import sys
from pathlib import Path

from app.main import app

DEFAULT_OUTPUT = Path(__file__).resolve().parents[2] / "frontend" / "openapi.json"


def render_schema() -> str:
    return json.dumps(app.openapi(), indent=2) + "\n"


def main() -> None:
    output = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_OUTPUT
    output.write_text(render_schema(), encoding="utf-8")
    print(f"Wrote OpenAPI schema to {output}")


if __name__ == "__main__":
    main()
