"use client";

import { useEffect } from "react";

// Every route is a client component, so the metadata API (which only
// works on the server) can't give each page its own <title> — this sets
// it directly instead. Resets isn't needed on unmount: the next page's
// own call to this hook overwrites it before the user ever sees the old
// value.
export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = title;
  }, [title]);
}
