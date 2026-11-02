"""Run the same-origin Web Locks smoke harness in Chromium, Firefox and WebKit."""
from __future__ import annotations

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

FRONTEND_ROOT = Path(__file__).resolve().parents[2]


def main() -> None:
    handler = partial(SimpleHTTPRequestHandler, directory=str(FRONTEND_ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    url = f"http://127.0.0.1:{server.server_port}/tests/browser/web-locks.html"
    failures: list[str] = []

    try:
        with sync_playwright() as playwright:
            for name in ("chromium", "firefox", "webkit"):
                browser = None
                try:
                    engine = getattr(playwright, name)
                    browser = engine.launch(headless=True)
                    page = browser.new_page()
                    page_errors: list[str] = []
                    page.on("pageerror", lambda error: page_errors.append(str(error)))
                    page.goto(url, wait_until="load", timeout=20_000)
                    page.wait_for_function(
                        "document.documentElement.dataset.result !== undefined",
                        timeout=10_000,
                    )
                    result = page.locator("#result").inner_text()
                    if not result.startswith("PASS") or page_errors:
                        failures.append(
                            f"{name} {browser.version}: {result}; page_errors={page_errors}"
                        )
                    else:
                        print(f"PASS {name} {browser.version}: {result.splitlines()[0]}")
                except Exception as error:  # Report missing browser binaries as a CI failure.
                    failures.append(f"{name}: {type(error).__name__}: {error}")
                finally:
                    if browser is not None:
                        browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

    if failures:
        raise SystemExit("\n".join(failures))


if __name__ == "__main__":
    main()
