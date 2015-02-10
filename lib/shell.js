require('shelljs/global');
var u = require('./utils');

var separator = '==================';

var shell = {
	exec: execCommand,
	executeCommands: executeCommands,
	getChangedFilesBetween: getChangedFilesBetween,
	getHeadHash: getHeadHash
};

function execCommand (cmd) {
	return exec(cmd, { silent: true });
}


function getChangedFilesBetween (beginHash, endHash) {
	if (!beginHash || !endHash) {
		throw new Error('Can\'t compute diff commit hash is missing');
	}

	var cmd = 'git diff --name-only ' + beginHash + ' ' + endHash;
	return execCommand(cmd).output.split('\n').filter(Boolean);
}

function getHeadHash () {
	return execCommand('git log --pretty=%H | head -n 1')
		.output.split('\n')
		.filter(Boolean)
		.shift()
		.trim();
}

function executeCommands (commands) {
	commands.forEach(function (cmd) {
		u.info('Executing:', cmd);

		var result = execCommand(cmd);

		if (result.code != 0) {
			throw new Error(result.output);
		}

		u.info('Success:', cmd);
		u.info(result.output + separator);
	});
}

module.exports = shell;
