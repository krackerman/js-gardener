const log = require("fancy-log");
const chalk = require("chalk");
const util = require('./util');
const copySubtask = require('./subtasks/copy');
const packageSubtask = require('./subtasks/package');
const configureSubtask = require('./subtasks/configure');
const badgesSubtask = require('./subtasks/badges');
const structSubtask = require('./subtasks/struct');
const eslintSubtask = require('./subtasks/eslint');
const flowSubtask = require('./subtasks/flow');
const yamllintSubtask = require('./subtasks/yamllint');
const depcheckSubtask = require('./subtasks/depcheck');
const depusedSubtask = require('./subtasks/depused');

module.exports = ({
  logger = log,
  cwd = process.cwd(),
  skip = [],
  rules = {
    "flow-enforce": 1
  }
} = {}) => {
  const savedCwd = process.cwd();
  process.chdir(cwd);

  const tasks = {
    copy: () => copySubtask(logger, cwd),
    package: () => packageSubtask(logger, cwd),
    configure: () => configureSubtask(logger, cwd),
    badges: () => badgesSubtask(logger, cwd),
    structure: () => structSubtask(logger, cwd, util.loadConfig(cwd, ".structignore")),
    eslint: () => eslintSubtask(logger, cwd, util.getEsLintFiles(cwd, util.loadConfig(cwd, ".eslintignore")), rules),
    flow: () => flowSubtask(logger, cwd),
    yamllint: () => yamllintSubtask(logger, cwd, util.getYamlFiles(cwd)),
    depcheck: () => depcheckSubtask(logger, cwd),
    depused: () => depusedSubtask(logger, cwd, util.loadConfig(cwd, ".depunusedignore"))
  };

  return [
    'copy',
    'package',
    'configure',
    'badges',
    'structure',
    'eslint',
    'flow',
    'yamllint',
    'depcheck',
    'depused'
  ]
    .filter(e => skip.indexOf(e) === -1)
    .reduce((prev, cur) => prev.then(() => {
      logger.info(`Running: ${chalk.green(cur)}`);
      return tasks[cur]();
    }), Promise.resolve())
    .then(() => process.chdir(savedCwd));
};
