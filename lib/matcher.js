var _ = require('lodash');

function Matcher (minimatch) {
	this.minimatch = minimatch;
}

// Find out which triggers should be executing through patterns matching
// Returns unique commands set
Matcher.prototype.findTriggersToExecute = function findTriggersToExecute (triggers, files) {
	var self = this;
	var commands = [];

	_.forEach(triggers, findCommandsToExecute);
	
	return _.unique(commands);

	function findCommandsToExecute (cmd, pattern) {
		if (isChanged(pattern, files)) {
			commands.push(cmd);
		}
	}

	function isChanged (pattern, files) {
		return files.filter(function (f) {
			return self.minimatch(f, pattern);
		}).length;
	}
};

Matcher.prototype.findInitialTriggersToExecute = function findInitialTriggersToExecute (triggers) {
	return _.unique(_.values(triggers));
};

module.exports = Matcher;
