# Directives

This folder contains **Standard Operating Procedures (SOPs)** written in Markdown.

## Purpose

Directives define:
- **Goals**: What needs to be accomplished
- **Inputs**: Required data or parameters
- **Tools/Scripts**: Which execution scripts to use
- **Outputs**: Expected deliverables
- **Edge Cases**: Known issues and how to handle them

## Guidelines

1. Write directives like instructions for a mid-level employee
2. Use natural language that's clear and unambiguous
3. Reference execution scripts by path (e.g., `execution/script_name.py`)
4. Update directives when you learn something new (API limits, edge cases, better approaches)

## Template

```markdown
# [Directive Name]

## Goal
[What this directive accomplishes]

## Inputs
- [Required input 1]
- [Required input 2]

## Execution
1. Run `execution/script_name.py` with [parameters]
2. [Additional steps]

## Outputs
- [Expected output 1]
- [Expected output 2]

## Edge Cases
- [Known issue and how to handle it]

## Learnings
- [Documented insights from previous runs]
```
