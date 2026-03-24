#!/bin/bash
set -e

echo "🔧 Configuring Firebase Storage CORS..."

# Check if gsutil is installed
if ! command -v gsutil &> /dev/null
then
    echo "❌ gsutil not found. Please install Google Cloud SDK"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Determine bucket from Firebase project
BUCKET="gs://broubook.firebasestorage.app"
echo "📦 Bucket: $BUCKET"

# Apply CORS configuration
echo "⚙️  Applying CORS configuration..."
gsutil cors set storage-cors.json "$BUCKET"

# Verify
echo "✅ Verifying configuration..."
gsutil cors get "$BUCKET"

echo "✅ CORS configuration applied successfully!"
