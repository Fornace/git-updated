// setup.js
const fs = require('fs');
const path = require('path');
const setHooks = require('simple-git-hooks');

const hooks = {
  "post-commit": "node ./node_modules/git-updated/updateJson.js"
};

setHooks(hooks).then(() => {
  console.log('Git Updated hooks set successfully.');
}).catch((error) => {
  console.error('Error setting Git Updated hooks:', error);
});