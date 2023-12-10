// git-updated.js
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const projectDir = process.env.INIT_CWD;
const dbFilePath = path.join(projectDir, 'gitUpdatedList.json');

function updateDatabaseWithFileChanges() {
  const filesChanged = execSync('git diff --name-only HEAD HEAD~1').toString().trim().split('\n');
  const timestamp = new Date().toISOString();

  let db;
  if (fs.existsSync(dbFilePath)) {
    db = JSON.parse(fs.readFileSync(dbFilePath));
  } else {
    db = {};
  }

  filesChanged.forEach(file => {
    db[file] = { lastEdited: timestamp };
  });

  fs.writeFileSync(dbFilePath, JSON.stringify(db, null, 2));
}

updateDatabaseWithFileChanges();