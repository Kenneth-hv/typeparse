#!/usr/bin/node

const execSync = require("child_process").execSync;

const includeFiles = ["package.json", "README.md", "LICENSE"];

const commands = [
  "rm -rf ./publish/out",
  "yarn publish:build",
  `cp -r ${includeFiles.join(" ")} ./publish/out`,
  `node ./publish/test/module.test.js`,
];

commands.forEach(execSync);
