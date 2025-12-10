import sys
import os
from mangum import Mangum
try:
    from .server import app
except ImportError:
    from server import app

# Configura o handler para o Netlify Functions (AWS Lambda)
handler = Mangum(app)
