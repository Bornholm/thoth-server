var express = require('express');
var bodyParser = require('body-parser');
var api = express();
var cors = require('cors');
var requestLogger = require('./middlewares/request-logger');
var errorHandler = require('./middlewares/error-handler');

api.set('json spaces', 2);

/* Common middlewares */

api.use(requestLogger());
api.use(bodyParser.json());
api.use(cors());

/* Routes */

api.use('/', require('./dummy'));

/* ErrorHandler - /!\ doit être appelé en dernier  */
api.use(errorHandler());

module.exports = api;
