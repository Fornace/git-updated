const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

// Logging function to append messages to a log file
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
        logToFile('git-updated: No package.json found. Initializing with npm init -y.');
        execSync('npm init -y', { cwd: projectRoot });
    }

    logToFile('git-updated: Reading package.json.');
    let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

    // Ensure devDependencies exist
    packageJson.devDependencies = packageJson.devDependencies || {};

    // Setup Husky
    if (!packageJson.devDependencies.husky) {
        logToFile('git-updated: Adding Husky to devDependencies.');
        packageJson.devDependencies.husky = '^7.0.0';
    } else {
        logToFile('git-updated: Husky already exists in devDependencies.');
    }

    // Configure Husky hooks
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    const prePushCommand = 'node ./node_modules/git-updated/git-updated.js';

    if (packageJson.husky.hooks['pre-push']) {
        logToFile('git-updated: Existing pre-push hook found.');
        if (!packageJson.husky.hooks['pre-push'].includes(prePushCommand)) {
            logToFile('git-updated: Appending to existing pre-push hook.');
            packageJson.husky.hooks['pre-push'] += ' && ' + prePushCommand;
        } else {
            logToFile('git-updated: git-updated command already present in pre-push hook.');
        }
    } else {
        logToFile('git-updated: No pre-push hook found. Creating one.');
        packageJson.husky.hooks['pre-push'] = prePushCommand;
    }

    // Write changes to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    logToFile('git-updated: Husky configuration updated in package.json.');
}

modifyPackageJson();
