// setup.js
console.warn("postcd -install script")

const fs = require('fs');
const path = require('path');
const {setHooks} = require('simple-pre-commit')


const hooks2 = {
  "post-commit": "node ./node_modules/git-updated/updateJson.js"
};

setHooks(hooks2).then(() => {
  console.log('Git Updated hooks set successfully.');
}).catch((error) => {
  console.error('Error setting Git Updated hooks:', error);
});