import sys
import os
from mangum import Mangum

# Add current directory to path to ensure local server.py can be imported
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Add parent directory to path as fallback for local dev
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from server import app

# Configura o handler para o Netlify Functions (AWS Lambda)
handler = Mangum(app)
