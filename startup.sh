#!/bin/bash

# Navigate to app directory
cd /home/site/wwwroot

# Start the server - check for standalone deployment first
if [ -f "server.js" ]; then
  echo "Starting standalone server (deployed)..."
  node server.js
elif [ -d ".next/standalone" ] && [ -f ".next/standalone/server.js" ]; then
  echo "Starting standalone server (built locally)..."
  node .next/standalone/server.js
elif [ -d ".next" ]; then
  echo "Starting standard Next.js server..."
  npm start
else
  echo "No build found. Building Next.js application..."
  npm install
  npm run build
  if [ -d ".next/standalone" ]; then
    node .next/standalone/server.js
  else
    npm start
  fi
fi
