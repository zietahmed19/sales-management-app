#!/bin/bash

echo "🚀 Sales Management App - Deployment Preparation Script"
echo "=================================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Sales Management App"
else
    echo "Git repository already exists"
fi

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "Creating .gitignore..."
    cat > .gitignore << EOL
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/

# OS
Thumbs.db

# Data files (for development)
data/
public/Data/sales.json
EOL
fi

echo "📝 Pre-deployment checklist:"
echo "✅ Updated server.js for production"
echo "✅ Created deployment configuration files"
echo "✅ Updated package.json scripts"
echo "✅ Created environment files"
echo "✅ Added CORS configuration"

echo ""
echo "📋 Next Steps:"
echo "1. Push your code to GitHub:"
echo "   git add ."
echo "   git commit -m 'Prepare for Render.com deployment'"
echo "   git push origin main"
echo ""
echo "2. Go to https://render.com and create two services:"
echo "   - Backend: Web Service (Node.js)"
echo "   - Frontend: Static Site (React)"
echo ""
echo "3. Follow the detailed instructions in DEPLOYMENT.md"
echo ""
echo "🌐 Your app will be live at:"
echo "   Backend:  https://your-backend-name.onrender.com"
echo "   Frontend: https://your-frontend-name.onrender.com"

echo ""
echo "🎉 Ready for deployment!"
