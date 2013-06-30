module.exports = exports = function(err, req, res, next) {
	console.error(err.stack);
	res.status(err.status ? err.status : 500);
	res.json(err);
}