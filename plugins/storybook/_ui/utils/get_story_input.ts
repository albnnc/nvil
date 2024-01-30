export function getStoryInput(): unknown {
  const url = new URL(location.href);
  try {
    const inputJson = url.searchParams.get("story-input") || "";
    return JSON.parse(inputJson);
  } catch {
    return undefined;
  }
}
