const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = require(packageJsonPath);

function setupHusky() {
    const huskyConfig = packageJson['husky'] || {};
    const hooks = huskyConfig['hooks'] || {};

    // Add or modify pre-push hook
    const prePushScript = 'node ./node_modules/git-updated/git-updated.js';
    hooks['pre-push'] = hooks['pre-push'] ? `${hooks['pre-push']} && ${prePushScript}` : prePushScript;

    // Update package.json
    packageJson['husky'] = {...huskyConfig, hooks};
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('git-updated: Husky pre-push hook configured.');
}

if (fs.existsSync(packageJsonPath)) {
    setupHusky();
} else {
    console.error('git-updated: No package.json found. Please ensure you are in the root directory of your project.');
}
