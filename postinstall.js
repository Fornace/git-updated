const fs = require('fs');
const path = require('path');

const huskyDir = path.join(process.cwd(), '.husky');
const prePushHook = path.join(huskyDir, 'pre-push');
const commandToAdd = "npx git-updated";

function setupHusky() {
    if (!fs.existsSync(huskyDir)) {
        // Husky not installed, proceed with installation
        require('child_process').execSync('npx husky install');
    }

    if (fs.existsSync(prePushHook)) {
        // Append to existing pre-push hook
        const hookContent = fs.readFileSync(prePushHook, 'utf-8');
        if (!hookContent.includes(commandToAdd)) {
            fs.appendFileSync(prePushHook, `\n${commandToAdd}`);
        }
    } else {
        // Create a new pre-push hook
        require('child_process').execSync(`npx husky add .husky/pre-push "${commandToAdd}"`);
    }
}

setupHusky();
