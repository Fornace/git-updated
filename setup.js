// setup.js
const fs = require('fs');
const path = require('path');

const hookScript = `#!/bin/sh
node ${path.join(__dirname, 'git-updated.js')}
`;

const hooksDir = path.join('.git', 'hooks');
const hookPath = path.join(hooksDir, 'post-commit');

// Ensure .git/hooks directory exists
if (!fs.existsSync(hooksDir)) {
  console.error('No .git/hooks directory found. Please initialize a git repository before installing git-updated.');
  process.exit(1);
}

// Write the post-commit hook script
fs.writeFileSync(hookPath, hookScript, { mode: '755' });
console.log('Post-commit hook for git-updated has been created.');