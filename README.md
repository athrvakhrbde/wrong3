# Wrong3

[![Netlify Status](https://api.netlify.com/api/v1/badges/a3ce5ae3-d99b-4202-8c71-0e0bcbd38ea6/deploy-status)](https://app.netlify.com/sites/wrong/deploys)

A Next.js application deployed on Netlify.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This project automatically deploys to Netlify:
- Push to `main` branch for production deployment
- Pull requests get preview deployments

## Environment Setup

Make sure to set up these environment variables in your Netlify dashboard:
- `NODE_VERSION`: 18
- `NPM_VERSION`: 10
- `NEXT_TELEMETRY_DISABLED`: 1 