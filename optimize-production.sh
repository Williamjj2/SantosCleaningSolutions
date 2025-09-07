#!/bin/bash

# Santos Cleaning - Production Optimization Script
# This script will drastically improve site performance

echo "🚀 Starting Santos Cleaning Performance Optimization..."

# 1. Clean old assets (keep only the latest version)
echo "📦 Cleaning old JavaScript bundles..."
cd /var/www/santos-cleaning-frontend/static/js

# Find the newest main.js file
NEWEST_MAIN=$(ls -t main.*.js 2>/dev/null | head -1)
if [ ! -z "$NEWEST_MAIN" ]; then
    echo "Keeping: $NEWEST_MAIN"
    # Remove all other main.js files
    for file in main.*.js; do
        if [ "$file" != "$NEWEST_MAIN" ]; then
            rm -f "$file" "$file.map" "$file.LICENSE.txt" 2>/dev/null
        fi
    done
fi

# Clean duplicate chunk files
echo "📦 Cleaning duplicate chunks..."
for pattern in "462." "680." "701." "718." "739." "804." "973."; do
    NEWEST=$(ls -t ${pattern}*.chunk.js 2>/dev/null | head -1)
    if [ ! -z "$NEWEST" ]; then
        for file in ${pattern}*.chunk.js; do
            if [ "$file" != "$NEWEST" ]; then
                rm -f "$file" "$file.map" 2>/dev/null
            fi
        done
    fi
done

# 2. Clean old CSS files
echo "🎨 Cleaning old CSS files..."
cd /var/www/santos-cleaning-frontend/static/css
NEWEST_CSS=$(ls -t main.*.css 2>/dev/null | head -1)
if [ ! -z "$NEWEST_CSS" ]; then
    echo "Keeping: $NEWEST_CSS"
    for file in main.*.css; do
        if [ "$file" != "$NEWEST_CSS" ]; then
            rm -f "$file" "$file.map" 2>/dev/null
        fi
    done
fi

# 3. Remove all .map files (not needed in production)
echo "🗑️ Removing source maps..."
find /var/www/santos-cleaning-frontend -name "*.map" -type f -delete

# 4. Compress all JS and CSS files with gzip
echo "🗜️ Compressing assets..."
cd /var/www/santos-cleaning-frontend
find . -type f \( -name "*.js" -o -name "*.css" -o -name "*.html" \) ! -name "*.gz" -exec gzip -9 -k {} \;

# 5. Set proper permissions
echo "🔐 Setting permissions..."
chown -R ubuntu:ubuntu /var/www/santos-cleaning-frontend
chmod -R 755 /var/www/santos-cleaning-frontend

# 6. Clear nginx cache
echo "🧹 Clearing Nginx cache..."
rm -rf /var/cache/nginx/*

# 7. Restart services
echo "🔄 Restarting services..."
systemctl reload nginx

echo "✅ Optimization complete!"

# Show results
echo ""
echo "📊 Results:"
echo "JS files: $(ls /var/www/santos-cleaning-frontend/static/js/*.js 2>/dev/null | wc -l)"
echo "CSS files: $(ls /var/www/santos-cleaning-frontend/static/css/*.css 2>/dev/null | wc -l)"
echo "Total size: $(du -sh /var/www/santos-cleaning-frontend/static | cut -f1)"

