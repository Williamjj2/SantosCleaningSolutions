
import sys
import os
from mangum import Mangum

# Adiciona o diretório pai (raiz do projeto) ao caminho do Python
# Isso permite importar o server.py que está na raiz
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app

# Configura o handler para o Netlify Functions (AWS Lambda)
handler = Mangum(app)
