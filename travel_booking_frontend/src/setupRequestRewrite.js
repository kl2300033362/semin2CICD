// rewrite requests to strip hard-coded backend host during development
// This helps when existing code uses absolute URLs like 'http://localhost:8080/...'
// so that CRA dev-server proxy (configured in package.json) can forward them.

if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  (function () {
    const BACKEND_HOST = 'http://localhost:8080';

    // Patch fetch
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      try {
        if (typeof input === 'string' && input.startsWith(BACKEND_HOST)) {
          input = input.replace(BACKEND_HOST, '');
        } else if (input && input.url && typeof input.url === 'string' && input.url.startsWith(BACKEND_HOST)) {
          input = new Request(input.url.replace(BACKEND_HOST, ''), input);
        }
      } catch (e) {
        // ignore
      }
      return originalFetch.call(this, input, init);
    };

    // Patch XHR open used by axios
    const origOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (method, url, async, user, password) {
      try {
        if (typeof url === 'string' && url.startsWith(BACKEND_HOST)) {
          url = url.replace(BACKEND_HOST, '');
        }
      } catch (e) {
        // ignore
      }
      return origOpen.call(this, method, url, async, user, password);
    };
  })();
}
