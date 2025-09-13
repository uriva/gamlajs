/**
 * POST JSON to a URL and return the Response.
 * @example
 * await postJson('https://api.example.com', { a: 1 })
 */
export const postJson = <T>(url: string, body: T): Promise<Response> =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

/**
 * Fetch and parse JSON, throwing on non-200 responses.
 * @example
 * const data = await fetchJson<{ ok: boolean }>('https://example.com/data')
 */
export const fetchJson = <T>(...params: Parameters<typeof fetch>): Promise<T> =>
  fetch(...params).then(async (x: Response) => {
    if (x.status === 200) return x.json() as Promise<T>;
    throw new Error(
      `Failed fetching ${params[0]} ${x.status} ${x.statusText} ${await x
        .text()}`,
    );
  });

/** Fetch and return text, throwing on non-200 responses. */
export const fetchText = (...x: Parameters<typeof fetch>): Promise<string> =>
  fetch(...x).then(async (x: Response) => {
    if (x.status === 200) return x.text();
    throw new Error(
      `failed fetching ${x.status} ${x.statusText} ${await x
        .text()
        .catch(() => "")}`,
    );
  });
