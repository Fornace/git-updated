// updateJson.js
const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');
const { execSync } = require('child_process');

const db = new JsonDB(new Config("gitUpdatedDB", true, false, '/'));

function updateDatabaseWithFileChanges() {
  const filesChanged = execSync('git diff --name-only HEAD HEAD~1').toString().trim().split('\n');
  const timestamp = new Date().toISOString();

  filesChanged.forEach(file => {
    db.push(`/${file}`, { lastEdited: timestamp });
  });

  db.save();
}

updateDatabaseWithFileChanges();