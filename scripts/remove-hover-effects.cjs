const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '../src/pages');

// Function to recursively scan files in a directory
function scanFiles(dir) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      scanFiles(filePath);
    } else if (filePath.endsWith('.jsx')) {
      removeHoverEffects(filePath);
    }
  });
}

// Function to remove hover effects from a file
function removeHoverEffects(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  const hoverRegex = /hover:[^'"\s]+/g; // Matches hover-related classes
  const updatedContent = content.replace(hoverRegex, ''); // Remove hover classes

  if (content !== updatedContent) {
    fs.writeFileSync(filePath, updatedContent, 'utf-8');
    console.log(`Updated: ${filePath}`);
  }
}

// Start scanning the pages folder
scanFiles(pagesDir);