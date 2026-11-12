import type { components } from "./schema";

type Schemas = components["schemas"];

export type HealthResponse = Schemas["HealthResponse"];
export type Audit = Schemas["Audit"];
export type Issue = Schemas["Issue"];
export type IssueEvidence = Schemas["IssueEvidence"];
export type TriageRequest = Schemas["TriageRequest"];
export type TriageIssueInput = Schemas["TriageIssueInput"];
export type TriageResponse = Schemas["TriageResponse"];
export type TriageResult = Schemas["TriageResult"];

export type Priority = TriageResult["priority"];
export type Impact = NonNullable<Issue["impact"]>;
