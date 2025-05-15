#!/bin/zsh

# Exit on any error
set -e

echo "🔧 Building frontend..."
npm run build

echo "🚀 Removing old assets on server..."
ssh qiriosvps 'rm -rf /home/sarik/qirios_frontend_build/assets/*'

echo "📁 Copying index.html to templates folder..."
scp ./dist/index.html qiriosvps:/home/sarik/qirios_triggers/templates/

echo "📁 Copying icon to templates folder..."
scp ./dist/surgeon.png qiriosvps:/home/sarik/qirios_frontend_build/

echo "📁 Copying assets folder to VPS..."
scp -r ./dist/assets qiriosvps:/home/sarik/qirios_frontend_build/

echo "✅ Deployment complete!"
