from pathlib import Path

from fastapi.testclient import TestClient

from app.api.audits import get_sample_audit_path
from app.main import app


def test_get_sample_audit_returns_converted_audit(client: TestClient):
    response = client.get("/api/v1/audits/sample")

    assert response.status_code == 200
    body = response.json()
    assert body["engine"] == "axe-core 4.10.2"
    assert len(body["issues"]) == 5


def test_sample_audit_issues_include_our_fields(client: TestClient):
    response = client.get("/api/v1/audits/sample")
    first_issue = response.json()["issues"][0]

    assert first_issue["review_status"] == "unreviewed"
    assert first_issue["rule_id"] == "image-alt"
    assert "html" in first_issue["evidence"]


def test_missing_sample_file_returns_safe_500(client: TestClient, tmp_path: Path):
    missing_file = tmp_path / "does-not-exist.json"
    app.dependency_overrides[get_sample_audit_path] = lambda: missing_file

    response = client.get("/api/v1/audits/sample")

    assert response.status_code == 500
    assert response.json() == {"detail": "Sample audit data is unavailable."}
    assert str(tmp_path) not in response.text


def test_invalid_sample_file_returns_safe_500(client: TestClient, tmp_path: Path):
    broken_file = tmp_path / "broken.json"
    broken_file.write_text("{ not valid json", encoding="utf-8")
    app.dependency_overrides[get_sample_audit_path] = lambda: broken_file

    response = client.get("/api/v1/audits/sample")

    assert response.status_code == 500
    assert response.json() == {"detail": "Sample audit data is unavailable."}
    assert str(tmp_path) not in response.text
