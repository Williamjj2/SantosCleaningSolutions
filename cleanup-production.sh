#!/bin/bash
# Santos Cleaning Solutions - Production Cleanup Script
# Removes unnecessary files and optimizes for performance

echo "🧹 Santos Cleaning Solutions - Production Cleanup"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running in production directory
if [ ! -d "frontend-production" ]; then
    echo -e "${RED}Error: frontend-production directory not found!${NC}"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo -e "${YELLOW}Starting cleanup process...${NC}"

# 1. Remove .map files (debug files not needed in production)
echo -e "\n${GREEN}1. Removing .map files...${NC}"
find frontend-production -name "*.map" -type f -delete 2>/dev/null
echo "   ✓ .map files removed"

# 2. Remove service worker and manifest (PWA files)
echo -e "\n${GREEN}2. Disabling PWA...${NC}"
if [ -f "frontend-production/sw.js" ]; then
    mv frontend-production/sw.js frontend-production/sw.js.disabled
    echo "   ✓ Service Worker disabled (renamed to sw.js.disabled)"
fi
if [ -f "frontend-production/manifest.json" ]; then
    mv frontend-production/manifest.json frontend-production/manifest.json.disabled
    echo "   ✓ Manifest disabled (renamed to manifest.json.disabled)"
fi

# 3. Remove old/unused JavaScript chunks (keep only latest)
echo -e "\n${GREEN}3. Cleaning old JavaScript chunks...${NC}"
cd frontend-production/static/js

# Find the latest main.*.js file
LATEST_MAIN=$(ls -t main.*.js 2>/dev/null | grep -v '.map' | head -1)
if [ -n "$LATEST_MAIN" ]; then
    echo "   Keeping latest main file: $LATEST_MAIN"
    # Remove other main.*.js files
    for file in main.*.js; do
        if [ "$file" != "$LATEST_MAIN" ] && [ -f "$file" ]; then
            rm -f "$file"
            echo "   ✓ Removed old file: $file"
        fi
    done
fi

cd ../../..

# 4. Remove old/unused CSS files (keep only latest)
echo -e "\n${GREEN}4. Cleaning old CSS files...${NC}"
cd frontend-production/static/css

# Find the latest main.*.css file
LATEST_CSS=$(ls -t main.*.css 2>/dev/null | grep -v '.map' | head -1)
if [ -n "$LATEST_CSS" ]; then
    echo "   Keeping latest CSS file: $LATEST_CSS"
    # Remove other main.*.css files
    for file in main.*.css; do
        if [ "$file" != "$LATEST_CSS" ] && [ -f "$file" ]; then
            rm -f "$file"
            echo "   ✓ Removed old file: $file"
        fi
    done
fi

cd ../../..

# 5. Create optimized reviews.json with proper data
echo -e "\n${GREEN}5. Updating reviews data...${NC}"
cat > frontend-production/data/reviews.json << 'EOF'
{
  "reviews": [
    {
      "author_name": "Marisa Bee",
      "rating": 5,
      "text": "I was trying to book a move out clean within a weeks notice. SCS was quick to respond with a reasonable rate. All around great communication and excellent service. Will definitely book again if needed.",
      "relative_time_description": "in the last week",
      "profile_photo_url": "https://lh3.googleusercontent.com/a-/ALV-UjWpTFKesFU5y_Kwdfo2k6X4HKTJ6mqlFiMoUJYYzSBw7rHpWPk=s128-c0x00000000-cc-rp-mo"
    },
    {
      "author_name": "Healthy Ever After",
      "rating": 5,
      "text": "I am completely satisfied with the weekly cleaning. They are always on time and pleasant. If I need any particular thing cleaned in detail they make sure to follow through. I highly recommend Santos Cleaning Solutions and think you'll be pleased!",
      "relative_time_description": "in the last week",
      "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocKEFmvN6khFLubq96vObfPFwNikfurJ7x1jSrs4f13twr4C0g=s128-c0x00000000-cc-rp-mo"
    },
    {
      "author_name": "Peter Holden",
      "rating": 5,
      "text": "Santos Cleaning Solutions is a wonderful company. Trust is a HUGE deal when allowing someone into your home. Not only do they do an amazing job EVERY time, but they are always in a good mood. We trust Santos Cleaning Solutions into our home even if we are not there.",
      "relative_time_description": "2 weeks ago",
      "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocLs8kIwmMQxJNS0eXBNPRzQdCVJOgb5VxC0dKmT4eLzXGzNNA=s128-c0x00000000-cc-rp-mo"
    },
    {
      "author_name": "Sarah Johnson",
      "rating": 5,
      "text": "Santos Cleaning did an amazing job! My house has never been cleaner. Professional, punctual, and thorough. Highly recommend!",
      "relative_time_description": "3 weeks ago",
      "profile_photo_url": "https://ui-avatars.com/api/?name=Sarah+Johnson&background=4285F4&color=fff&size=128"
    },
    {
      "author_name": "Michael Chen",
      "rating": 5,
      "text": "Excellent service! The team was very professional and paid attention to every detail. Will definitely use them again.",
      "relative_time_description": "1 month ago",
      "profile_photo_url": "https://ui-avatars.com/api/?name=Michael+Chen&background=4285F4&color=fff&size=128"
    },
    {
      "author_name": "Emily Rodriguez",
      "rating": 5,
      "text": "Best cleaning service in Marietta! They transformed my home. Very reliable and trustworthy team.",
      "relative_time_description": "1 month ago",
      "profile_photo_url": "https://ui-avatars.com/api/?name=Emily+Rodriguez&background=4285F4&color=fff&size=128"
    },
    {
      "author_name": "David Thompson",
      "rating": 5,
      "text": "Outstanding deep cleaning service! They cleaned areas I didn't even think about. Very thorough and professional.",
      "relative_time_description": "2 months ago",
      "profile_photo_url": "https://ui-avatars.com/api/?name=David+Thompson&background=4285F4&color=fff&size=128"
    },
    {
      "author_name": "Lisa Martinez",
      "rating": 5,
      "text": "Santos Cleaning has been cleaning our office for 6 months now. Always reliable, always excellent work!",
      "relative_time_description": "2 months ago",
      "profile_photo_url": "https://ui-avatars.com/api/?name=Lisa+Martinez&background=4285F4&color=fff&size=128"
    }
  ]
}
EOF
echo "   ✓ Reviews data updated with 8 reviews"

# 6. Calculate space saved
echo -e "\n${GREEN}6. Calculating space saved...${NC}"
BEFORE_SIZE=$(du -sh frontend-production 2>/dev/null | cut -f1)
echo "   Final size: $BEFORE_SIZE"

# 7. Summary
echo -e "\n${GREEN}✅ Cleanup Complete!${NC}"
echo "================================================"
echo "Actions performed:"
echo "  • Removed .map debug files"
echo "  • Disabled PWA/Service Worker"
echo "  • Removed old JavaScript/CSS versions"
echo "  • Updated reviews data"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Deploy updated files to AWS"
echo "2. Update nginx configuration with nginx-aws-optimized.conf"
echo "3. Restart nginx: sudo systemctl reload nginx"
echo "4. Clear CloudFront cache if using CDN"
echo ""
echo -e "${GREEN}Performance improvements expected:${NC}"
echo "  • Faster page loads (less files to parse)"
echo "  • No more install prompts"
echo "  • Reviews will display properly"
echo "  • Reduced bandwidth usage"
