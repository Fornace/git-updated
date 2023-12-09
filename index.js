const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

async function updateFileDates() {
    try {
        const git = simpleGit();

        // Check if we are in a Git repository
        const isRepo = await git.checkIsRepo();
        if (!isRepo) throw new Error("Not a Git repository.");

        // Find the root directory of the Git repository
        const repoRoot = await git.revparse(['--show-toplevel']);

        // Fetch the log for all files
        const log = await git.log();
        const fileDates = {};

        log.all.forEach(commit => {
            commit.files.forEach(file => {
                if (!fileDates[file]) {
                    fileDates[file] = commit.date;
                }
            });
        });

        // Define the path for the JSON file relative to the repository root
        const jsonFilePath = path.join(repoRoot, '.git-updated', 'file_dates.json');

        // Create the .git-updated directory if it doesn't exist
        fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });

        // Write the dates to the JSON file
        fs.writeFileSync(jsonFilePath, JSON.stringify(fileDates, null, 2));
        console.log('File dates updated in .git-updated/file_dates.json');
    } catch (error) {
        console.error('Error updating file dates:', error);
    }
}

if (require.main === module) {
    updateFileDates();
}

module.exports = updateFileDates;
