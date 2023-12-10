// setup.js
const fs = require('fs');
const path = require('path');

function findGitRoot(currentDir) {
  if (fs.existsSync(path.join(currentDir, '.git'))) {
    return currentDir;
  }
  const parentDir = path.resolve(currentDir, '..');
  if (parentDir === currentDir) {
    throw new Error('Unable to find .git directory');
  }
  return findGitRoot(parentDir);
}

const projectRoot = findGitRoot(__dirname);
const hookFileName = 'pre-commit-git-updated';
const hookScript = `#!/bin/sh
# Hook created by git-updated
node ${path.join(__dirname, 'git-updated.js')} && git add ${path.join(projectRoot, 'gitUpdatedDB.json')}
`;

const hooksDir = path.join(projectRoot, '.git', 'hooks');
const hookPath = path.join(hooksDir, hookFileName);

// Ensure .git/hooks directory exists
if (!fs.existsSync(hooksDir)) {
  console.error('No .git/hooks directory found. Please initialize a git repository before installing git-updated.');
  process.exit(1);
}

// Write the pre-commit hook script
fs.writeFileSync(hookPath, hookScript, { mode: '755' });

// Append invocation to existing pre-commit hook if it exists
const existingPreCommitHookPath = path.join(hooksDir, 'pre-commit');
if (fs.existsSync(existingPreCommitHookPath)) {
  let existingHookContent = fs.readFileSync(existingPreCommitHookPath, 'utf8');
  if (!existingHookContent.includes(hookFileName)) {
    existingHookContent += `\n. ${hookPath}\n`;
    fs.writeFileSync(existingPreCommitHookPath, existingHookContent, { mode: '755' });
  }
} else {
  // If no pre-commit hook exists, create one that calls our hook
  fs.writeFileSync(existingPreCommitHookPath, `#!/bin/sh\n. ${hookPath}\n`, { mode: '755' });
}

console.log('Pre-commit hook for git-updated has been created.');