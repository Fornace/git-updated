// cleanup.js
const fs = require('fs');
const path = require('path');

function findGitRoot(currentDir) {
  if (fs.existsSync(path.join(currentDir, '.git'))) {
    return currentDir;
  }
  const parentDir = path.resolve(currentDir, '..');
  if (parentDir === currentDir) {
    return null; // Reached the filesystem root without finding a .git directory
  }
  return findGitRoot(parentDir);
}

const projectRoot = findGitRoot(__dirname);
const hookFileName = 'pre-commit-git-updated';

if (projectRoot) {
  const hooksDir = path.join(projectRoot, '.git', 'hooks');
  const hookPath = path.join(hooksDir, hookFileName);
  const existingPreCommitHookPath = path.join(hooksDir, 'pre-commit');

  // Remove the specific pre-commit hook file
  if (fs.existsSync(hookPath)) {
    fs.unlinkSync(hookPath);
    console.log('Specific pre-commit hook for git-updated has been removed.');
  }

  // Remove invocation from existing pre-commit hook
  if (fs.existsSync(existingPreCommitHookPath)) {
    let existingHookContent = fs.readFileSync(existingPreCommitHookPath, 'utf8');
    const hookInvocation = `. ${hookPath}\n`;
    if (existingHookContent.includes(hookInvocation)) {
      existingHookContent = existingHookContent.replace(hookInvocation, '');
      fs.writeFileSync(existingPreCommitHookPath, existingHookContent, { mode: '755' });
      console.log('Invocation of git-updated removed from pre-commit hook.');
    }
  }
} else {
  console.error('Unable to find .git directory. No cleanup necessary.');
}