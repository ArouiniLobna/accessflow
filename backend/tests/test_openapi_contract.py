from scripts.export_openapi import DEFAULT_OUTPUT, render_schema


def test_committed_openapi_schema_is_up_to_date():
    committed = DEFAULT_OUTPUT.read_text(encoding="utf-8")

    assert committed == render_schema(), (
        "frontend/openapi.json is out of date. "
        "Run: uv run python -m scripts.export_openapi, then npm run generate:api"
    )
