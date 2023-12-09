const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

async function updateFileDates() {
    const logFilePath = path.join(__dirname, 'git-updated.log');
    const logToFile = (message) => fs.appendFileSync(logFilePath, message + '\n');

    try {
        logToFile('git-updated: Starting to update file dates.');

        const git = simpleGit();
        const isRepo = await git.checkIsRepo();

        if (!isRepo) {
            throw new Error("Not a Git repository.");
        }

        logToFile('git-updated: Confirmed as a Git repository.');

        const repoRoot = await git.revparse(['--show-toplevel']);
        logToFile(`git-updated: Git repository root: ${repoRoot}`);

        const log = await git.log();
        const fileDates = {};

        log.all.forEach(commit => {
            commit.files.forEach(file => {
                // Only update if the file's date is newer
                if (!fileDates[file] || fileDates[file] < commit.date) {
                    fileDates[file] = commit.date;
                }
            });
        });

        const jsonFilePath = path.join(repoRoot, '.git-updated', 'file_dates.json');
        fs.mkdirSync(path.dirname(jsonFilePath), { recursive: true });
        fs.writeFileSync(jsonFilePath, JSON.stringify(fileDates, null, 2));

        logToFile(`git-updated: File dates updated in ${jsonFilePath}`);
    } catch (error) {
        const errorMessage = `git-updated: Error updating file dates: ${error}`;
        console.error(errorMessage);
        logToFile(errorMessage);
    }
}

if (require.main === module) {
    updateFileDates();
}

module.exports = updateFileDates;