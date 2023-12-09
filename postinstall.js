const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

function logToFile(message) {
    const logFilePath = path.join(__dirname, 'git-updated-install.log');
    fs.appendFileSync(logFilePath, message + '\n');
}

function modifyPackageJson() {
    logToFile('git-updated: Starting postinstall script.');

    const projectRoot = process.env.INIT_CWD || process.cwd();
    logToFile(`git-updated: Project root determined as: ${projectRoot}`);

    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        logToFile('git-updated: Initializing npm project with npm init -y.');
        execSync('npm init -y', { cwd: projectRoot });
    }

    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Check if Husky is installed and add it to devDependencies if not
    if (!packageJson.devDependencies || !packageJson.devDependencies.husky) {
        logToFile('git-updated: Husky not found in devDependencies. Installing Husky.');
        execSync('npm add husky --save-dev', { cwd: projectRoot });
        packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')); // Re-read package.json after modification
    } else {
        logToFile('git-updated: Husky is already listed in devDependencies.');
    }

    // Configure Husky hooks
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    const prePushCommand = 'node ./node_modules/git-updated/git-updated.js';

    if (!packageJson.husky.hooks['pre-push']) {
        logToFile('git-updated: No pre-push hook found. Creating one.');
        packageJson.husky.hooks['pre-push'] = prePushCommand;
    } else if (!packageJson.husky.hooks['pre-push'].includes(prePushCommand)) {
        logToFile('git-updated: Appending to existing pre-push hook.');
        packageJson.husky.hooks['pre-push'] += ' && ' + prePushCommand;
    } else {
        logToFile('git-updated: git-updated command already present in pre-push hook.');
    }

    // Write changes to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logToFile('git-updated: Husky configuration updated in package.json.');
}

modifyPackageJson();