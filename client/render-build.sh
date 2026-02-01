#!/usr/bin/env bash
# exit on error
set -o errexit

echo "🚀 Building WhatsApp Pro Frontend..."

# Install dependencies
npm install

# Build
npm run build

# Copy _redirects to dist
cp _redirects dist/_redirects

echo "✅ Build completed!"
