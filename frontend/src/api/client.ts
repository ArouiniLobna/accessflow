export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function readJson<T>(
  response: Response,
  description: string,
): Promise<T> {
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${description} failed with status ${response.status}`,
    );
  }
  return (await response.json()) as T;
}

export async function getJson<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, { signal });
  return readJson<T>(response, `GET ${path}`);
}

export async function postJson<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  return readJson<T>(response, `POST ${path}`);
}
