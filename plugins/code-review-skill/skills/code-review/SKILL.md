---
name: code-review
description: Structured code review with quality, security, and best practice analysis
version: 1.0.0
---

# Code Review

Review the provided code for:

1. **Code Quality**: Naming, structure, readability, DRY violations
2. **Security**: Input validation, injection risks, credential exposure
3. **Performance**: Unnecessary allocations, N+1 queries, blocking calls
4. **Best Practices**: Error handling, logging, testing coverage

Output a structured review with severity levels (critical, warning, suggestion) for each finding.
