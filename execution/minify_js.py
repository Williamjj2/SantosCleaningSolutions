import os
import re

def minify_js(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Remove single line comments
    content = re.sub(r'//.*', '', content)
    # Remove multi-line comments
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove whitespace
    content = re.sub(r'\s+', ' ', content)
    # Remove spaces around common operators
    content = re.sub(r'\s*([{};,:])\s*', r'\1', content)
    
    with open(file_path, 'w') as f:
        f.write(content)
    print(f"Minified {file_path}")

def process_directory(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.js') and not file.endswith('.min.js'):
                path = os.path.join(root, file)
                minify_js(path)

if __name__ == "__main__":
    process_directory('frontend-production/js')
