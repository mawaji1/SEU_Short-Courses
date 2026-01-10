#!/bin/bash

# ============================================
# DGA React Library Setup Script
# ============================================
# This script installs the dga-react library
# and icons into your Next.js/React project.
# ============================================

# Configuration - Update these paths as needed
DGA_REACT_SOURCE="/Users/mawaji/Desktop-corrupted/Projects/Design_Code/dga-react"
ICONS_SOURCE="/Users/mawaji/Desktop-corrupted/Projects/Design_Code/test-app/public/icons"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "============================================"
echo "   DGA React Library Setup"
echo "============================================"
echo ""

# Check if source exists
if [ ! -d "$DGA_REACT_SOURCE" ]; then
    echo -e "${RED}Error: dga-react source not found at:${NC}"
    echo "  $DGA_REACT_SOURCE"
    echo ""
    echo "Please update the DGA_REACT_SOURCE variable in this script."
    exit 1
fi

# Step 1: Build the library
echo -e "${YELLOW}Step 1/4:${NC} Building dga-react library..."
cd "$DGA_REACT_SOURCE"
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Build successful"
else
    echo -e "  ${RED}✗${NC} Build failed. Running npm install first..."
    npm install > /dev/null 2>&1
    npm run build > /dev/null 2>&1
fi
cd - > /dev/null

# Step 2: Remove old version
echo -e "${YELLOW}Step 2/4:${NC} Removing old dga-react..."
if [ -d "node_modules/dga-react" ]; then
    rm -rf node_modules/dga-react
    echo -e "  ${GREEN}✓${NC} Old version removed"
else
    echo -e "  ${GREEN}✓${NC} No old version found"
fi

# Step 3: Copy library
echo -e "${YELLOW}Step 3/4:${NC} Copying dga-react library..."
cp -r "$DGA_REACT_SOURCE" node_modules/dga-react
if [ $? -eq 0 ]; then
    echo -e "  ${GREEN}✓${NC} Library copied to node_modules/dga-react"
else
    echo -e "  ${RED}✗${NC} Failed to copy library"
    exit 1
fi

# Step 4: Copy icons
echo -e "${YELLOW}Step 4/4:${NC} Copying DGA icons..."
if [ -d "$ICONS_SOURCE" ]; then
    mkdir -p public/icons
    cp -r "$ICONS_SOURCE"/* public/icons/
    ICON_COUNT=$(find public/icons -name "*.svg" | wc -l | tr -d ' ')
    echo -e "  ${GREEN}✓${NC} Copied $ICON_COUNT icons to public/icons/"
else
    echo -e "  ${YELLOW}!${NC} Icons source not found. Skipping..."
    echo "    You may need to copy icons manually from:"
    echo "    $ICONS_SOURCE"
fi

echo ""
echo "============================================"
echo -e "  ${GREEN}Setup Complete!${NC}"
echo "============================================"
echo ""
echo "Usage in your project:"
echo ""
echo "  import { Button, Card, DgaIcon } from 'dga-react';"
echo "  import 'dga-react/styles.css';"
echo ""
echo "For Next.js, add to next.config.ts if needed:"
echo ""
echo "  transpilePackages: ['dga-react']"
echo ""
