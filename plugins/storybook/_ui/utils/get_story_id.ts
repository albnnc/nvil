export function getStoryId() {
  const url = new URL(location.href);
  return url.searchParams.get("story-id") || undefined;
}
