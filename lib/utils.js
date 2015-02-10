module.exports.halt = function halt () {
	console.error.apply(console, arguments);
	process.exit();
};

module.exports.info = function info () {
	console.log.apply(console, arguments);
};
