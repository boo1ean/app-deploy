var Promise = require('bluebird');

function Storage (conf) {
	this.conf = conf;

	if (!this.conf.get('deploys')) {
		this.conf.set('deploys', []);
	}

	if (!this.conf.get('remotes')) {
		this.conf.set('remotes', {});
	}
}

Storage.prototype.saveDeployInfo = function saveDeployInfo (deploy) {
	var deploys = this.conf.get('deploys');
	deploys.push(deploy);
	this.conf.set('deploys', deploys);
};

Storage.prototype.saveRemote = function saveRemote (name, url) {
	var remotes = this.conf.get('remotes');
	remotes[name] = url;
	this.conf.set('remotes', remotes);
};

Storage.prototype.getRemotes = function getRemotes () {
	return this.conf.get('remotes');
}

Storage.prototype.getRecentDeployHash = function getRecentDeployHash () {
	var deploy = this.conf.get('deploys').pop();

	if (!deploy) {
		return null;
	}

	return deploy.hash;
};

Storage.prototype.getDeploysCount = function getDeploysCount () {
	return this.conf.get('deploys').length;
};

module.exports = Storage;
