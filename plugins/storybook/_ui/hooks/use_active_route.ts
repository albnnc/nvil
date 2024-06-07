import { useCallback } from "react";
import { useLocation } from "react-router-dom";

export function useActiveRoute() {
  const { pathname } = useLocation();
  const check = useCallback(
    (candidates: string[]) => {
      for (const path of candidates) {
        if (path.includes(":")) {
          const regex = new RegExp(
            "^" + path.replace(/:[^\s/]+/g, "([^/]+)") + "$",
          );
          const match = pathname.match(regex);
          if (match) {
            return true;
          }
        } else {
          if (path === pathname) {
            return true;
          }
        }
      }
      return false;
    },
    [pathname],
  );

  return [check];
}
