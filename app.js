var Thoth = require('./lib/thoth');
var app = new Thoth();

app.startWebServer(function(err) {
	if(err) {
		app.logger.error(err.stack);
		process.exit(1);
	}
});







