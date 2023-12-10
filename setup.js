// setup.js
const fs = require('fs');
const path = require('path');

let maxRecursive = 10;

function findGitRoot(currentDir) {
  if (maxRecursive-- < 0) {
    throw new Error(`No git directory found up to ${maxRecursive} levels up`);
  }
  const gitDir = path.join(currentDir, '.git');
  if (fs.existsSync(gitDir)) {
    return gitDir;
  } else {
    return findGitRoot(path.join(currentDir, '..'));
  }
}

const projectDir = process.env.INIT_CWD;
const gitRoot = findGitRoot(projectDir);

const hookFileName = 'pre-commit-git-updated';
const logFilePath = path.join(projectDir, 'git-updated-hook.log');
const hookScriptContent = `#!/bin/sh
# Hook created by git-updated
echo "Running pre-commit-git-updated hook" >> ${logFilePath}
node ${path.join(__dirname, 'git-updated.js')} >> ${logFilePath} 2>&1
if [ $? -eq 0 ]; then
  git add ${path.join(projectDir, 'gitUpdatedList.json')} >> ${logFilePath} 2>&1
fi
echo "pre-commit-git-updated hook completed" >> ${logFilePath}
`;

const hooksDir = path.join(gitRoot, 'hooks');
const hookPath = path.join(hooksDir, hookFileName);

if (!fs.existsSync(hooksDir)) {
  fs.writeFileSync(logFilePath, 'No .git/hooks directory found. Please initialize a git repository before installing git-updated.\n', { flag: 'a' });
  process.exit(1);
}

fs.writeFileSync(hookPath, hookScriptContent, { mode: 0o755 });

const existingPreCommitHookPath = path.join(hooksDir, 'pre-commit');
if (fs.existsSync(existingPreCommitHookPath)) {
  let existingHookContent = fs.readFileSync(existingPreCommitHookPath, 'utf8');
  if (!existingHookContent.includes(hookFileName)) {
    existingHookContent += `\n. ${hookPath}\n`;
    fs.writeFileSync(existingPreCommitHookPath, existingHookContent, { mode: 0o755 });
  }
} else {
  fs.writeFileSync(existingPreCommitHookPath, `#!/bin/sh\n. ${hookPath}\n`, { mode: 0o755 });
}

fs.writeFileSync(logFilePath, 'Pre-commit hook for git-updated has been created.\n', { flag: 'a' });