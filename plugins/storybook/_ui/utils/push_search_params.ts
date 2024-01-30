export function pushSearchParams(...kvPairs: [string, string | undefined][]) {
  const searchParams = new URLSearchParams(location.search);
  kvPairs.forEach(([k, v]) => {
    if (v) {
      searchParams.set(k, v);
    } else {
      searchParams.delete(k);
    }
  });
  history.pushState({}, "", `?` + searchParams.toString());
  dispatchEvent(new CustomEvent("pushSearchParams"));
}
