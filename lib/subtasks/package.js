const path = require("path");
const merge = require('lodash.merge');
const defaultsDeep = require('lodash.defaultsdeep');
const mapValues = require('lodash.mapvalues');
const util = require("./../util");

// rewrite package.json
module.exports = (grunt, cwd) => {
  const gitUrl = util.getGitUrl(cwd);
  const packageFile = path.join(cwd, 'package.json');
  const packageJson = grunt.file.readJSON(packageFile);
  const packageTemplate = JSON.parse(grunt.file
    .read(`${__dirname}/../templates/package.json`)
    .replace(/{{GIT_URL}}/g, gitUrl));
  merge(packageJson, packageTemplate.force);
  defaultsDeep(packageJson, packageTemplate.defaults);
  ['dependencies', 'devDependencies'].forEach((deps) => {
    packageJson[deps] = mapValues(packageJson[deps], dep => dep.replace(/^\^/, ''));
  });
  grunt.file.write(packageFile, `${JSON.stringify(packageJson, null, 2)}\n`);
};