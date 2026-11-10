"""
Models describing raw axe-core output
These represent scanner evidence exactly as received.
Our own data (review status, priority, AI suggestions  lives in separate models)

"""

from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from pydantic.alias_generators import to_camel

Impact = Literal["minor", "moderate", "serious", "critical"]


class AxeModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel)


class AxeTestEngine(AxeModel):
    name: str
    version: str


class AxeNode(AxeModel):
    html: str
    target: list[str | list[str]]
    failure_summary: str | None = None


class AxeViolation(AxeModel):
    id: str
    impact: Impact | None = None
    tags: list[str]
    description: str
    help: str
    help_url: HttpUrl
    nodes: list[AxeNode] = Field(min_length=1)


class AxeReport(AxeModel):
    url: str
    timestamp: datetime
    test_engine: AxeTestEngine
    violations: list[AxeViolation]
