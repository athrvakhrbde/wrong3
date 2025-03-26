#!/bin/bash

# Display environment information
echo "===== ENVIRONMENT INFO ====="
echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Clean install without any optional dependencies
echo "\n===== INSTALLING DEPENDENCIES ====="
npm ci --no-optional --no-audit --no-fund --prefer-offline

# Build the Next.js application
echo "\n===== BUILDING NEXT.JS APP ====="
npm run build

echo "\n===== BUILD COMPLETED ====="
