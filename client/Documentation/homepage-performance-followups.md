# Homepage performance follow-ups (text-only)

This repository change intentionally avoids generating binary assets.  
After merging, run the commands below locally to generate responsive image variants and refresh the optimized image set.

## Required local commands

```bash
cd client
npm run media:bootstrap
npm run media:optimize -- src/assets/img src/assets/img/optimized "360,720,1080"
```

## Notes

- The third argument (`"360,720,1080"`) tells the optimizer to emit responsive variants such as:
  - `residential-cleaning-360.avif`
  - `residential-cleaning-720.webp`
  - `commercial-cleaning-1080.avif`
- Commit the generated files in a separate media-only PR so this performance/code PR stays text-only.
