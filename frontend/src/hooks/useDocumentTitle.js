import { useEffect } from 'react';

const BASE_TITLE = 'Internal Task Dashboard';
const APP_NAME = 'Internal Tools';

/** Sets the browser tab title, e.g. "Internal Tools | Tasks". */
export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${APP_NAME} | ${title}` : BASE_TITLE;
    return () => {
      document.title = BASE_TITLE;
    };
  }, [title]);
}
