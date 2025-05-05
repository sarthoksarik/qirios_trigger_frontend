#!/bin/zsh

# Exit on any error
set -e

echo "🔧 Building frontend..."
npm run build

echo "🚀 Removing old assets on server..."
ssh sarik@5.223.47.56 'rm -rf /home/sarik/qirios_frontend_build/assets/*'

echo "📁 Copying index.html to templates folder..."
scp ./dist/index.html sarik@5.223.47.56:/home/sarik/qirios_triggers/templates/

echo "📁 Copying assets folder to VPS..."
scp -r ./dist/assets sarik@5.223.47.56:/home/sarik/qirios_frontend_build/assets/

echo "🔁 Restarting Gunicorn via Supervisor..."
ssh sarik@5.223.47.56 'supervisorctl restart qirios_gunicorn'

echo "✅ Deployment complete!"
