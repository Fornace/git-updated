const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function logToFile(message) {
    const logFilePath = path.join(__dirname, '..', '..', 'git-updated-install.log');
    fs.appendFileSync(logFilePath, new Date().toISOString() + ' - ' + message + '\n');
}

function initializePackageJson(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
        logToFile('git-updated: No package.json found. Initializing npm project with npm init -y.');
        execSync('npm init -y', { cwd: projectRoot, stdio: 'inherit' });
    }
}

function installHusky(projectRoot) {
    logToFile('git-updated: Installing Husky.');
    execSync('npm install husky --save-dev', { cwd: projectRoot, stdio: 'inherit' });
}

function modifyPackageJson(projectRoot) {
    const packageJsonPath = path.join(projectRoot, 'package.json');
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

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

(function postinstall() {
    try {
        const projectRoot = path.join(__dirname, '..', '..');
        logToFile('git-updated: Assuming project root is two levels up: ' + projectRoot);

        initializePackageJson(projectRoot);
        installHusky(projectRoot);
        modifyPackageJson(projectRoot);

        console.log('git-updated: Postinstall script completed successfully.');
    } catch (error) {
        logToFile(`git-updated: An error occurred during postinstall: ${error}`);
        console.error('git-updated: An error occurred during postinstall. Check git-updated-install.log for details.');
    }
})();