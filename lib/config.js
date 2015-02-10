var fs = require('fs');

function Config (path) {
	this.path = path;

	this.readConfig();
	this.validateConfig();

	this.triggers = this.config.triggers;
}

Config.prototype.readConfig = function readConfig () {
	if (!this.path) {
		throw new Error('Please specify config file');
	}

	if (!fs.existsSync(this.path)) {
		throw new Error('Config is not found ' + this.path);
	}

	try {
		this.config = JSON.parse(fs.readFileSync(this.path).toString());
	} catch (e) {
		throw new Error('Config reading error');
	}
}

Config.prototype.validateConfig = function validateConfig () {
	if (!this.config || !this.config.triggers) {
		throw new Error('Wrong config: triggers settings are required');
	}
}

module.exports = Config;
