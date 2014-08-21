# N.A.P. Bootstrap

Node API Project Bootstrap

## Démarrer avec les sources

```
# Récupération des sources
git clone https://github.com/bornholm/nap-bootstrapr.git
cd nap-bootstrap

# Installation des dépendances
npm install

# Initialisation de la BDD
# npm install sqlite3 # Base de développement
npm run knex migrate:latest

# Si besoin, installer Bunyan
# sudo npm install -g bunyan
NODE_ENV=development node server | bunyan
```

## Licence

AGPL
