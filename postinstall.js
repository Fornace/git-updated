const fs = require('fs');
const path = require('path');

function modifyPackageJson() {
    console.log('git-updated: Starting postinstall script.');

    const projectRoot = path.join(process.cwd());
    const packageJsonPath = path.join(projectRoot, 'package.json');
    let packageJson;

    // Check if package.json exists
    if (fs.existsSync(packageJsonPath)) {
        console.log('git-updated: Found package.json.');
        packageJson = require(packageJsonPath);
    } else {
        // Initialize a basic package.json structure if it doesn't exist
        console.log('git-updated: No package.json found. Initializing a basic structure.');
        packageJson = {
            name: 'your-project',
            version: '1.0.0',
            scripts: {},
            devDependencies: {}
        };
    }

    // Ensure devDependencies exist
    packageJson.devDependencies = packageJson.devDependencies || {};

    // Setup Husky
    if (!packageJson.devDependencies.husky) {
        console.log('git-updated: Adding Husky to devDependencies.');
        packageJson.devDependencies.husky = '^7.0.0';
    } else {
        console.log('git-updated: Husky is already in devDependencies.');
    }

    // Configure Husky hooks
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    const prePushCommand = 'node ./node_modules/git-updated/git-updated.js';
    const existingPrePush = packageJson.husky.hooks['pre-push'];

    if (existingPrePush) {
        console.log('git-updated: Existing pre-push hook found.');
        // Append if there's an existing pre-push hook
        if (!existingPrePush.includes(prePushCommand)) {
            console.log('git-updated: Appending to existing pre-push hook.');
            packageJson.husky.hooks['pre-push'] = existingPrePush + ' && ' + prePushCommand;
        } else {
            console.log('git-updated: Command already present in pre-push hook.');
        }
    } else {
        // Create a new pre-push hook
        console.log('git-updated: Creating a new pre-push hook.');
        packageJson.husky.hooks['pre-push'] = prePushCommand;
    }

    // Write changes to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('git-updated: Husky configuration updated.');
}

modifyPackageJson();
