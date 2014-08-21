# N.A.P. Bootstrap

Node API Project Bootstrap

## Démarrer avec les sources

```sh
# Récupération des sources
git clone https://github.com/bornholm/nap-bootstrap.git
cd nap-bootstrap

# Installation des dépendances
npm install

# Initialisation de la BDD
# npm install sqlite3 # Base de développement
npm run migrate:latest

# Si besoin, installer Bunyan
# sudo npm install -g bunyan
NODE_ENV=development node server | bunyan
```

## Créer un fichier de migration

Dans un terminal
```
./node_modules/knex/lib/bin/cli.js migrate:make <tag>
vi migrations/*_<tag>.js
```

migrations/*_<tag>.js
```js
'use strict';

// La méthode "up()" est utilisée pour modifier la structure de la base lors
// du passage de script de migration lors d'une montée de version
exports.up = function(knex, Promise) {

  return Promise.all([

    knex.schema.createTable('accounts', function(table) {

      table.charset('utf8'); // Encodage UTF-8
      table.string('email').unique().primary(); // Colonne 'email' avec contrainte d'unicité
      // etc...
    }),

    knex.schema.createTable('tickets', function(table) {

      table.charset('utf8'); // Encodage UTF-8
      table.increments('id').primary(); // Colonne 'id', PK auto inc
      //etc..
    })

  ]);

};

// La méthode "down()" est utilisée pour modifier la structure de la base lors d'un rollback
exports.down = function(knex, Promise) {

  return Promise.all([
    knex.dropTable('accounts'), // On supprime simplement les tables créées dans le sens inverse
    knex.dropTable('tickets'),
  ]);

};
```
Pour plus d'informations, voir la documentation de [Knex.js](http://knexjs.org/#Migrations)

## Licence

AGPL
