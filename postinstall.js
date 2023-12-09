const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

function findProjectRoot(currentDir) {
    if (fs.existsSync(path.join(currentDir, '.git'))) {
        // Found the .git directory, return the current directory
        return currentDir;
    }

    const parentDir = path.resolve(currentDir, '..');
    if (parentDir === currentDir) {
        // Reached the filesystem root without finding .git
        return null;
    }

    return findProjectRoot(parentDir);
}

const projectRoot = findProjectRoot(__dirname);
if (!projectRoot) {
    console.error('Unable to find Git repository root. git-updated requires a Git repository.');
    process.exit(1);
}

const huskyDir = path.join(projectRoot, '.husky');
const prePushHook = path.join(huskyDir, 'pre-push');
const commandToAdd = "npx git-updated";

function setupHusky() {
    if (!fs.existsSync(huskyDir)) {
        // Husky not installed, proceed with installation
        execSync('npx husky install', { cwd: projectRoot });
    }

    if (fs.existsSync(prePushHook)) {
        // Append to existing pre-push hook
        const hookContent = fs.readFileSync(prePushHook, 'utf-8');
        if (!hookContent.includes(commandToAdd)) {
            fs.appendFileSync(prePushHook, `\n${commandToAdd}`);
        }
    } else {
        // Create a new pre-push hook
        execSync(`npx husky add .husky/pre-push "${commandToAdd}"`, { cwd: projectRoot });
    }
}

setupHusky();
