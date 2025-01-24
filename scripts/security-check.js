const fs = require('fs');
const path = require('path');

// Check for sensitive files accidentally committed
const sensitiveFiles = ['.env', 'secrets.js', 'credentials.json'];
sensitiveFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, '..', file))) {
        console.error(`WARNING: Sensitive file ${file} detected!`);
        process.exit(1);
    }
});

// Check for patterns of sensitive information
const sensitivePatterns = [
    /mongodb\+srv:\/\/[^<]*/,
    /password/i,
    /secret/i,
    /api[_-]key/i
];

// Add to package.json scripts
// "security-check": "node scripts/security-check.js" 