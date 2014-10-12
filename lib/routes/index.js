var express = require('express');
var bodyParser = require('body-parser');
var api = express();
var cors = require('cors');
var requestLogger = require('./middlewares/request-logger');
var errorHandler = require('./middlewares/error-handler');
var auth = require('../util/auth');

api.set('json spaces', 2);

/* Common middlewares */

api.use(requestLogger());
api.use(auth.middleware(auth.getBackends()));
api.use(bodyParser.json());
api.use(cors());

/* Routes */

api.use('/records', require('./records'));

/* ErrorHandler - /!\ doit être appelé en dernier  */
api.use(errorHandler());

module.exports = api;
