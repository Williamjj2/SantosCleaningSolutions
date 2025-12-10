import sys
import os
from mangum import Mangum
from server import app

# Configura o handler para o Netlify Functions (AWS Lambda)
handler = Mangum(app)
