import { useEffect, useState } from "react";

export function useSearchParams(keys: string[]): (string | undefined)[] {
  const [values, setValues] = useState(() => getSearchParams(keys));
  useEffect(() => {
    const listen = () => {
      setValues(getSearchParams(keys));
    };
    addEventListener("pushSearchParams", listen);
    return () => {
      removeEventListener("pushSearchParams", listen);
    };
  }, [keys]);
  return values;
}

function getSearchParams(keys: string[]): (string | undefined)[] {
  const searchParams = new URLSearchParams(location.search);
  return keys.map((k) => searchParams.get(k) ?? undefined);
}
