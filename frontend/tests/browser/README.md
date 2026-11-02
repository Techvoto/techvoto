# Browser smoke test

Serve the frontend directory from a secure context (localhost is sufficient):

```bash
cd frontend
python -m http.server 4173
```

Open `http://localhost:4173/tests/browser/web-locks.html` in each supported browser. A passing result is `PASS: same-origin contexts serialized by Web Locks`. The harness creates two same-origin iframes that contend for the same lock and fails if their critical sections overlap. Record browser version/device and result in the release validation report.

The Node regression suite separately tests the no-Web-Locks fail-closed path and verifies that it does not send a refresh request.
