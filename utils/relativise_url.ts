export function relativiseUrl(url: string, base: string) {
  const from = new URL("./", base);
  const to = new URL(url, base);
  return to.pathname.replace(from.pathname, "./");
}
