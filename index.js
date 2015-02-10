#!/usr/bin/env node

var Promise = require('bluebird');
var _ = require('lodash');
var minimatch = require('minimatch');
var shell = require('./lib/shell');
var u = require('./lib/utils');

var Configstore = require('configstore');
var Storage = require('./lib/storage');
var Matcher = require('./lib/matcher');
var Config = require('./lib/config');

var packageName = require('../package').name;
var defaultConfig = 'app-deploy.json';

if (isGitRepoMissing()) {
	u.halt('Git repository not found');
}

try {
	var conf    = new Configstore(packageName);
	var storage = new Storage(conf);
	var config  = new Config(process.argv[2] || defaultConfig);
	var matcher = new Matcher(minimatch);

	Promise.all([
		storage.getRecentDeployHash(),
		shell.getHeadHash()
	]).spread(function (recentDeployHash, headHash) {
		var commands;

		if (isEverythingDeployed(recentDeployHash, headHash)) {
			throw new Error('Nothing to deploy');
		}

		if (didNotDeployYet(recentDeployHash)) {
			commands = matcher.findInitialTriggersToExecute(config.triggers);
		} else {
			// Get list of changed files
			var files = shell.getChangedFilesBetween(recentDeployHash, headHash);

			// Changed files info
			u.info('Changed files:');
			u.info(files.join('\n'), '\n');

			// Get list of commands to execute according to changed files
			commands = matcher.findTriggersToExecute(config.triggers, files);
		}

		// Execute commands
		shell.executeCommands(commands);

		// Save deploy to completed deploys array
		storage.saveDeployInfo({ hash: headHash, commands: commands });

		u.info('Successfully deployed!');
	}).catch(handleError);
} catch (e) {
	handleError(e);
}

function isGitRepoMissing () {
	try {
		shell.exec('git st');
		return false;
	} catch (e) {
		return true;
	}
}

function didNotDeployYet (hash) {
	return !hash;
}

function isEverythingDeployed (left, right) {
	return left === right;
}

function handleError (e) {
	u.halt(e.message);
}

// 1. There is no git repo
// 2. There are no deploys
// 3. There are no new commits
// 4. There are new commits
