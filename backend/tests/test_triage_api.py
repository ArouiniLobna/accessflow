from typing import Any

from fastapi.testclient import TestClient

from app.schemas.triage import MAX_ISSUES_PER_REQUEST

TRIAGE_URL = "/api/v1/triage"


def valid_issue(**overrides: Any) -> dict[str, Any]:
    issue = {
        "id": "issue-1",
        "rule_id": "label",
        "impact": "critical",
        "wcag_criteria": ["1.3.1"],
    }
    issue.update(overrides)
    return issue


def first_error(response) -> dict[str, Any]:
    return response.json()["detail"][0]


def test_valid_request_returns_200_with_sorted_results(client: TestClient):
    payload = {
        "issues": [
            valid_issue(id="a", impact="minor"),
            valid_issue(id="b", impact="critical"),
        ]
    }

    response = client.post(TRIAGE_URL, json=payload)

    assert response.status_code == 200
    body = response.json()
    assert [r["issue_id"] for r in body["results"]] == ["b", "a"]
    assert body["counts"] == {"P1": 1, "P2": 0, "P3": 0, "P4": 1}


def test_null_impact_is_accepted(client: TestClient):
    response = client.post(TRIAGE_URL, json={"issues": [valid_issue(impact=None)]})

    assert response.status_code == 200
    assert response.json()["results"][0]["priority"] == "P3"


def test_missing_impact_is_rejected(client: TestClient):
    issue = valid_issue()
    del issue["impact"]

    response = client.post(TRIAGE_URL, json={"issues": [issue]})

    assert response.status_code == 422
    error = first_error(response)
    assert error["type"] == "missing"
    assert error["loc"] == ["body", "issues", 0, "impact"]


def test_empty_issue_list_is_rejected(client: TestClient):
    response = client.post(TRIAGE_URL, json={"issues": []})

    assert response.status_code == 422
    error = first_error(response)
    assert error["type"] == "too_short"
    assert error["loc"] == ["body", "issues"]


def test_too_many_issues_are_rejected(client: TestClient):
    issues = [valid_issue(id=f"issue-{n}") for n in range(MAX_ISSUES_PER_REQUEST + 1)]

    response = client.post(TRIAGE_URL, json={"issues": issues})

    assert response.status_code == 422
    assert first_error(response)["type"] == "too_long"


def test_duplicate_issue_ids_are_rejected(client: TestClient):
    payload = {"issues": [valid_issue(id="same"), valid_issue(id="same")]}

    response = client.post(TRIAGE_URL, json=payload)

    assert response.status_code == 422
    error = first_error(response)
    assert error["type"] == "value_error"
    assert error["loc"] == ["body"]
    assert "unique" in error["msg"]


def test_malformed_wcag_criterion_is_rejected(client: TestClient):
    issue = valid_issue(wcag_criteria=["1.3.1", "<script>"])

    response = client.post(TRIAGE_URL, json={"issues": [issue]})

    assert response.status_code == 422
    error = first_error(response)
    assert error["type"] == "string_pattern_mismatch"
    assert error["loc"] == ["body", "issues", 0, "wcag_criteria", 1]


def test_sample_audit_issues_can_be_triaged_over_http(client: TestClient):
    audit = client.get("/api/v1/audits/sample").json()

    response = client.post(TRIAGE_URL, json={"issues": audit["issues"]})

    assert response.status_code == 200
    assert response.json()["counts"] == {"P1": 3, "P2": 1, "P3": 0, "P4": 1}


def test_get_is_not_allowed(client: TestClient):
    response = client.get(TRIAGE_URL)

    assert response.status_code == 405
