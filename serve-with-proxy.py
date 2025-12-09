#!/usr/bin/env python3
"""
Servidor simples que serve o frontend e faz proxy das requisições da API
para o backend FastAPI
"""
import http.server
import socketserver
import urllib.request
import urllib.error
from urllib.parse import urlparse
import os
import sys

PORT = 8000
API_PORT = 8001
FRONTEND_DIR = "frontend-production"

class ProxyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # Se a requisição for para /api/*, fazer proxy para o backend
        if self.path.startswith('/api/'):
            self.proxy_to_backend()
        else:
            # Servir arquivos estáticos normalmente
            super().do_GET()
    
    def do_POST(self):
        # Proxy para requisições POST da API
        if self.path.startswith('/api/'):
            self.proxy_to_backend()
        else:
            self.send_error(405, "Method Not Allowed")
    
    def proxy_to_backend(self):
        """Faz proxy da requisição para o backend FastAPI"""
        try:
            # Construir URL do backend
            backend_url = f'http://localhost:{API_PORT}{self.path}'
            
            # Fazer requisição para o backend
            req = urllib.request.Request(backend_url)
            
            # Copiar headers relevantes
            for header in ['Content-Type', 'Accept']:
                if header in self.headers:
                    req.add_header(header, self.headers[header])
            
            # Fazer a requisição
            with urllib.request.urlopen(req, timeout=10) as response:
                # Enviar resposta de volta para o cliente
                self.send_response(response.status)
                
                # Copiar headers da resposta
                for header, value in response.headers.items():
                    if header.lower() not in ['server', 'date']:
                        self.send_header(header, value)
                
                self.end_headers()
                
                # Enviar corpo da resposta
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_error(e.code, str(e.reason))
        except Exception as e:
            print(f"❌ Erro no proxy: {e}")
            self.send_error(502, f"Backend error: {str(e)}")

def main():
    # Mudar para o diretório do frontend
    os.chdir(FRONTEND_DIR)
    
    with socketserver.TCPServer(("", PORT), ProxyHTTPRequestHandler) as httpd:
        print(f"🚀 Servidor rodando em http://localhost:{PORT}")
        print(f"📂 Servindo arquivos de: {FRONTEND_DIR}")
        print(f"🔄 Proxy da API: /api/* -> http://localhost:{API_PORT}/api/*")
        print(f"\n✨ Acesse: http://localhost:{PORT}\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Servidor encerrado!")
            sys.exit(0)

if __name__ == "__main__":
    main()


