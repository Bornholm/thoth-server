Thoth
=====

![Thoth](./client/img/logo.svg)

Application de gestion d'informations.

Caractéristiques
----------------

- Données chiffrées en base de données (AES256 par défaut)
- Gestion des droits d'accès via rôles & hiérarchie de catégories
- Recherche via labels/catégories/mots clé des ressources
- Différentes méthodes d'authentification via système de plugins (locale, LDAP...)
- Export des ressources au format archive, chiffré par défaut avec mot de passe personnel
- Administration via interface en ligne de commande
- API REST
- Client Web (optionel)
- Client en ligne de commande (pas encore implémenté)

Dépendances
-----------

- [Nodejs](http://nodejs.org/) - testé en version 0.10.22
- [MongoDB](http://www.mongodb.org/) - testé en version 2.4.8

Installation
------------

```
git clone http://forge-dev.in.ac-dijon.fr/git/thoth
cd thoth
npm install
touch config/$(hostname).yaml # Définir vos paramètres de configuration dans ce fichier

# Installer un plugin d'authentification - Exemple
# local: npm install git+http://<user>:<password>@forge-dev.in.ac-dijon.fr/git/thoth-local-auth
# ou
# ldap: npm install git+http://<user>:<password>@forge-dev.in.ac-dijon.fr/git/thoth-ldap-auth
# Voir ensuite le fichier config.sample.yaml dans le dossier node_modules/<plugin> pour un exemple de configuration
node app
```

Configuration
-------------

L'application charge les fichiers de configuration (si ils existent) du dossier `config` dans l'ordre suivant

1. defaults.yaml
2. $(hostname).yaml
3. ${NODE_ENV}.yaml

- Chaque fichier de configuration *surcharge* les propriétés du fichier précédent.
- Se référer au fichier `defaults.yaml` pour voir les paramètres de configuration disponibles
- Vous pouvez modifier le chemin par défaut du dossier de configuration en passant le paramètre `--configDir <chemin_dossier>` à l'application

Administration
--------------

L'administration de l'application se fait via l'outil en ligne de commande accessible dans le dossier `bin`

**Usage**
```
cd thoth
./bin/thoth --help
info: Initializing models
info: Connecting to database
info: Load plugin=thoth-ldap-auth
info: Starting CLI

  Usage: thoth [options] <namespace> <command>

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -p, --passphrase <passphrase>  specify the passphrase to use

  Commands:

    default
      add-role      Add a selected role to a registered user
      remove-role   Remove a selected role from a registered user

    ldap-auth
      register-user Register a LDAP user with his DN
      search-dn     Search LDAP for user's DN
```

### Commandes par défaut

- **add-role** Ajoute un des rôles présent dans la configuration à un utilisateur enregistré
- **remove-role** Retire un rôle à un utilisateur

Chaque plugin peut apporter son propre lot de commandes supplémentaires, dans son propre espace de nom.

Production
----------

Un des moyens de mettre en production l'application est de passer par un moniteur de processus comme [Forever](https://github.com/nodejitsu/forever).

**Exemple**
```
sudo npm install forever -g
cd thoth
forever start -e logs/thoth-err.log -o logs/thoth.log app.js -p <db_password>
```

L'application sera lancée en tant que démon et `forever` relancera automatiquement cette dernière si elle s'arrête de manière involontaire. D'autres arguments sont utilisables afin d'affiner le comportement de `forever`, voir la documentation du projet pour plus d'informations.

Licence
-------

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.