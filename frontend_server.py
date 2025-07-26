from http.server import HTTPServer, SimpleHTTPRequestHandler
import logging
import signal
import sys
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CustomHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="src/templates", **kwargs)
    
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

def signal_handler(sig, frame):
    logger.info('\nShutting down server gracefully...')
    sys.exit(0)

def run(server_class=HTTPServer, handler_class=CustomHandler):
    try:
        from config import FRONTEND_PORT, SERVER_HOST
        server_address = (SERVER_HOST, FRONTEND_PORT)
        httpd = server_class(server_address, handler_class)
        logger.info(f'Starting frontend server on http://{SERVER_HOST}:{FRONTEND_PORT}')
        logger.info(f'Serving files from: src/templates/')
        signal.signal(signal.SIGINT, signal_handler)
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info('\nShutting down server...')
        httpd.server_close()
        sys.exit(0)
    except Exception as e:
        logger.error(f'Server error: {e}')
        sys.exit(1)

if __name__ == '__main__':
    run()