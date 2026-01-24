#!/bin/bash

# Navigate to app directory
cd /home/site/wwwroot

# Build if .next doesn't exist or is empty
if [ ! -d ".next" ] || [ -z "$(ls -A .next)" ]; then
  echo "Building Next.js application..."
  npm run build
fi

# Start the server
if [ -d ".next/standalone" ]; then
  echo "Starting standalone server..."
  node .next/standalone/server.js
else
  echo "Starting standard Next.js server..."
  npm start
fi
