#!/usr/bin/env python3
"""Simple HTTP server with CORS support for braelyn.ai"""

import http.server
import socketserver

ALLOWED_ORIGIN = "https://braelyn.ai"


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


if __name__ == "__main__":
    PORT = 8000
    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"Serving on port {PORT} with CORS enabled for {ALLOWED_ORIGIN}")
        httpd.serve_forever()
