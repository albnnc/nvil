export const fetcher = (input: URL | Request | string, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());
