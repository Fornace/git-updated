const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

function logToFile(message) {
    const logFilePath = path.join(__dirname, 'git-updated-install.log');
    fs.appendFileSync(logFilePath, new Date().toISOString() + ' - ' + message + '\n');
}

function execCommand(command, options) {
    return new Promise((resolve, reject) => {
        exec(command, options, (error, stdout, stderr) => {
            if (error) {
                logToFile(`Error executing command: ${error}`);
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

async function modifyPackageJson() {
    logToFile('git-updated: Starting postinstall script.');

    try {
        const projectRoot = process.cwd();
        logToFile(`git-updated: Project root determined as: ${projectRoot}`);

        const packageJsonPath = path.join(projectRoot, 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            logToFile('git-updated: Initializing npm project with npm init -y.');
            await execCommand('npm init -y', { cwd: projectRoot });
        }

        let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

        // Check if Husky is installed
        let huskyInstalled;
        try {
            require.resolve('husky');
            huskyInstalled = true;
        } catch (e) {
            huskyInstalled = false;
        }

        if (!huskyInstalled) {
            logToFile('git-updated: Husky not found. Installing Husky.');
            await execCommand('npm install husky --save-dev', { cwd: projectRoot });
            packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8')); // Re-read package.json after modification
        } else {
            logToFile('git-updated: Husky is already installed.');
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
        console.log('git-updated: Postinstall script completed successfully.');
    } catch (error) {
        logToFile(`git-updated: An error occurred during postinstall: ${error}`);
        console.error('git-updated: An error occurred during postinstall. Check git-updated-install.log for details.');
    }
}

modifyPackageJson();