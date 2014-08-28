
// Configuration du serveur Web
exports.server = {
  port: 8080,
  host: 'localhost'
};

// Configuration de la base de données, voir http://knexjs.org/
exports.database = {
  client: 'sqlite3',
  connection: {
    filename: './data.sqlite3'
  }
};

// Configuration du logger
exports.logger = {
  name: 'NAP Bootstrap',
  level: 'info'
};
