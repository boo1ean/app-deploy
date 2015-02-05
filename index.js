#!/usr/bin/env node

var triggersConfigPath = process.argv[2];

if (!triggersConfigPath) {
	halt('Please specify config file');
}

var Configstore = require('configstore');
var packageName = require('./package').name;
var Promise = require('bluebird');
var execCommand = Promise.promisify(require('child_process').exec);
var fs = require('fs');
var _ = require('lodash');
var minimatch = require('minimatch');

var triggersConfig = JSON.parse(fs.readFileSync(triggersConfigPath).toString());

var conf = new Configstore(packageName);

validateConfig(triggersConfig);

function exec (cmd) {
	//console.log(cmd);
	return execCommand(cmd);
}

function validateConfig (config) {
	if (!config.triggers) {
		halt('Wrong config: triggers settings are required');
	}
}

function halt () {
	console.error.apply(console, arguments);
	process.exit();
}

function init () {
	if (!conf.get('deploys')) {
		conf.set('deploys', []);
	}
}

function pushDeployHash (hash) {
	var deploys = conf.get('deploys');
	deploys.push(hash);
	conf.set('deploys', deploys);
}

function getLastDeployHash () {
	return Promise.resolve(conf.get('deploys').pop());
}

function getLatestCurrentHash () {
	return exec('git log --pretty=%H | head -n 1').then(function (results) {
		return results.filter(Boolean).shift().trim();
	});
}

init();

Promise.all([
	getLastDeployHash(),
	getLatestCurrentHash()
]).spread(function (latestDeployHash, currentHash) {
	if (latestDeployHash === currentHash) {
		halt('Nothing to deploy');
	}

	var commands = [];

	if (!latestDeployHash) {
		return executeAllCommands()
			.then(finilizeDeploy);
	}

	function executeAllCommands () {
		commands = _.values(triggersConfig.triggers);
		return executeCommands();
	}

	var cmd = 'git diff --name-only ' + currentHash + ' ' + latestDeployHash;
	exec(cmd).then(function (results) {
		var output = results[0];

		if (output) {
			var files = output.split('\n').filter(Boolean);

			console.log('Changes:', files.join('\n'));

			_.forEach(triggersConfig.triggers, findCommandsToExecute);

			executeCommands()
				.then(finilizeDeploy);
		}

		function findCommandsToExecute (cmd, pattern) {
			if (isChanged(pattern, files)) {
				commands.push(cmd);
			}
		}

		function isChanged (pattern, files) {
			return files.filter(function (f) {
				return minimatch(f, pattern);
			}).length;
		}

	}).catch(console.error);

	function executeCommands () {
		return Promise.each(commands, execAndPrint);
	}

	function execAndPrint (cmd) {
		console.log(cmd);
		return exec(cmd).then(function (results) {
			var out = results.filter(Boolean)[0];

			if (out) {
				console.log(out);
			}

			console.log('=====================\n');
		})
		.catch(function (err) {
			halt(cmd, 'failed');
		});
	}

	function finilizeDeploy () {
		pushDeployHash(currentHash);
		console.log('success');
	}
});
