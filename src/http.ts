export const postJson = <T>(url: string, body: T) =>
  fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const fetchJson = <T>(...params: Parameters<typeof fetch>) =>
  fetch(...params).then(async (x: Response) => {
    if (x.status === 200) return x.json() as Promise<T>;
    throw new Error(
      `Failed fetching ${params[0]} ${x.status} ${x.statusText} ${await x
        .text()}`,
    );
  });

export const fetchText = (...x: Parameters<typeof fetch>) =>
  fetch(...x).then(async (x: Response) => {
    if (x.status === 200) return x.text();
    throw new Error(
      `failed fetching ${x.status} ${x.statusText} ${await x
        .text()
        .catch(() => "")}`,
    );
  });
