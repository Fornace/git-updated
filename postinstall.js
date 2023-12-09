const fs = require('fs');
const path = require('path');

function modifyPackageJson() {
    const projectRoot = path.join(process.cwd());
    const packageJsonPath = path.join(projectRoot, 'package.json');
    let packageJson;

    // Check if package.json exists
    if (fs.existsSync(packageJsonPath)) {
        packageJson = require(packageJsonPath);
    } else {
        // Initialize a basic package.json structure if it doesn't exist
        console.log('No package.json found. Initializing a basic structure.');
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
        packageJson.devDependencies.husky = '^7.0.0';
    }

    // Configure Husky hooks
    packageJson.husky = packageJson.husky || {};
    packageJson.husky.hooks = packageJson.husky.hooks || {};
    const prePushCommand = 'node ./node_modules/git-updated/git-updated.js';
    const existingPrePush = packageJson.husky.hooks['pre-push'];

    if (existingPrePush) {
        // Append if there's an existing pre-push hook
        if (!existingPrePush.includes(prePushCommand)) {
            packageJson.husky.hooks['pre-push'] = existingPrePush + ' && ' + prePushCommand;
        }
    } else {
        // Create a new pre-push hook
        packageJson.husky.hooks['pre-push'] = prePushCommand;
    }

    // Write changes to package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('git-updated: Husky configuration updated.');
}

modifyPackageJson();
