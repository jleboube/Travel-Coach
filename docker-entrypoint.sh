#!/bin/sh
set -e

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Switching to nextjs user and starting application..."
exec su-exec nextjs node server.js
