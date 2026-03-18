---
name: slurp_naming
description: Name analytics/tracking files and variables "slurp" instead of "tracking" to avoid ad blockers
type: feedback
---

Never name analytics files, variables, or endpoints with words like "tracking", "analytics", or "telemetry" — ad blockers will block them. Use "slurp" instead.

**Why:** Ad blockers filter requests and scripts with common tracking-related names.
**How to apply:** When adding event collection to any part of the site, use "slurp" in file names, function names, and paths.
