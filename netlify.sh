#!/bin/bash

# Display current directory
echo "Current directory: $(pwd)"

# List files in current directory
echo "Files in current directory:"
ls -la

# Run the build command
echo "Running npm run build..."
npm run build

# Create the publish directory if it doesn't exist
mkdir -p .next

# Copy the build output to the publish directory
echo "Build completed successfully!"
