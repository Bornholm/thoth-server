var Thoth = require('./lib/thoth');
var app = new Thoth();

app.startWebServer(function(err) {
	if(err) {
		app.logger.error('Error', err.stack);
		process.exit(1);
	}
});



