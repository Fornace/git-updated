const fs = require('fs');
const path = require('path');
const execSync = require('child_process').execSync;

function modifyPackageJson() {
    console.log('git-updated: Starting postinstall script.');

    // Determine the project root directory
    const projectRoot = process.env.INIT_CWD || process.cwd();
    console.log(`git-updated: Project root determined as: ${projectRoot}`);

    const packageJsonPath = path.join(projectRoot, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
        console.log('git-updated: No package.json found. Initializing with npm init -y.');
        execSync('npm init -y', { cwd: projectRoot });
    }

    console.log('git-updated: Reading package.json.');
    const packageJson = require(packageJsonPath);

    // Ensure devDependencies exist
    if (!packageJson.devDependencies) {
        console.log('git-updated: Initializing devDependencies.');
        packageJson.devDependencies = {};
    }

    // Setup Husky
    if (!packageJson.devDependencies.husky) {
        console.log('git-updated: Adding Husky to devDependencies.');
        packageJson.devDependencies.husky = '^7.0.0';
    } else {
        console.log('git-updated: Husky already exists in devDependencies.');
    }

    // Configure Husky hooks
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    const prePushCommand = 'node ./node_modules/git-updated/git-updated.js';

    if (packageJson.husky.hooks['pre-push']) {
        console.log('git-updated: Existing pre-push hook found.');
        if (!packageJson.husky.hooks['pre-push'].includes(prePushCommand)) {
            console.log('git-updated: Appending to existing pre-push hook.');
            packageJson.husky.hooks['pre-push'] += ' && ' + prePushCommand;
        } else {
            console.log('git-updated: git-updated command already present in pre-push hook.');
        }
    } else {
        console.log('git-updated: No pre-push hook found. Creating one.');
        packageJson.husky.hooks['pre-push'] = prePushCommand;
    }

    // Write changes to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('git-updated: Husky configuration updated in package.json.');
}

modifyPackageJson();
