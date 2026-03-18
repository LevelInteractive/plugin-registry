---
name: deploy
description: Guided deployment workflow with pre-flight checks
version: 1.0.0
---

# Deploy

Guide the user through a safe deployment:

1. **Pre-flight**: Check git status, run tests, verify branch
2. **Build**: Run the build pipeline and validate output
3. **Deploy**: Execute deployment to the target environment
4. **Verify**: Check health endpoints and rollback if needed

Always confirm the target environment before deploying.
