// setup.js
const { error } = require('console');
const fs = require('fs');
const path = require('path');

let maxRecursive = 0;

function findGitRoot(currentDir) {
  if (maxRecursive-- < 0) {
    throw new Error(`No git directory found up to ${maxRecursive} levels up`)
  };
  const gitDir = path.join(currentDir, '.git')
  if (fs.existsSync(gitDir)) {
    return gitDir;
  } else {
    return findGitRoot(path.join(currentDir, '..'));
  }
}
const projectDir = process.env.INIT_CWD;

const gitRoot = findGitRoot(projectDir);

console.log({gitRoot})

const hookFileName = 'pre-commit-git-updated';
const hookScript = `#!/bin/sh
# Hook created by git-updated
node ${path.join(__dirname, 'git-updated.js')} && git add ${path.join(__dirname, 'gitUpdatedList.json')}
`;

console.log('Hook Created: ' , hookScript)

const hooksDir = path.join(gitRoot, 'hooks');
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