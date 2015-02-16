var _ = require('lodash');
var Promise = require('bluebird');
var find = Promise.promisify(require('all-requires'));
var path = require('path');

function Matcher (minimatch) {
	this.minimatch = minimatch;
}

// Find out which triggers should be executing through patterns matching
// Returns unique commands set
Matcher.prototype.findTriggersToExecute = function findTriggersToExecute (triggers, files) {
	var self = this;
	var absFiles = files.map(function (relative) { return path.resolve(relative); });

	var patterns = _.keys(triggers);
	return Promise.reduce(patterns, function findCommandToExecute (commands, pattern) {
		if (isRequiresPattern(pattern)) {
			return find({ path: pattern.slice(1), onlyLocal: true }).then(function matchFiles (requires) {
				if (_.intersection(requires, absFiles).length) {
					commands.push(triggers[pattern]);
				}

				return commands;
			});
		} else if (isChanged(pattern, files)) {
			commands.push(triggers[pattern]);
		}

		return commands;
	}, []).then(_.unique);

	function isChanged (pattern, files) {
		return files.filter(function (f) {
			return self.minimatch(f, pattern);
		}).length;
	}

	function isRequiresPattern (pattern) {
		return pattern[0] === '+';
	}
};

Matcher.prototype.findInitialTriggersToExecute = function findInitialTriggersToExecute (triggers) {
	return Promise.resolve(_.unique(_.values(triggers)));
};

module.exports = Matcher;
