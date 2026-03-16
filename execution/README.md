# Execution Scripts

This folder contains **deterministic Python scripts** that handle the actual work.

## Purpose

Execution scripts:
- Handle API calls, data processing, file operations
- Interact with databases and external services
- Are reliable, testable, and fast
- Use environment variables from `.env` for credentials

## Guidelines

1. **Keep scripts deterministic** - Same inputs should produce same outputs
2. **Comment well** - Explain the logic, especially for complex operations
3. **Use `.env`** - Never hardcode credentials or API keys
4. **Handle errors gracefully** - Provide clear error messages
5. **Log important steps** - Help with debugging

## Template

```python
#!/usr/bin/env python3
"""
Script Name: [script_name.py]
Purpose: [What this script does]
Usage: python execution/script_name.py [args]

Inputs:
    - [input 1]: [description]
    - [input 2]: [description]

Outputs:
    - [output 1]: [description]

Environment Variables Required:
    - [VAR_NAME]: [description]
"""

import os
from dotenv import load_dotenv

load_dotenv()

def main():
    # Your implementation here
    pass

if __name__ == "__main__":
    main()
```

## Dependencies

All Python dependencies should be added to `requirements.txt` in the project root.
