Thoth
=====

![Thoth](./client/img/logo.svg)

Application de gestion d'informations confidentielles.

Caractéristiques
----------------

- Données chiffrées en base de données (AES256 par défaut)
- Gestion des droits d'accès via rôles & hiérarchie de catégories
- Recherche via labels des ressources et tags associés
- Différentes méthodes d'authentification via système de plugins (locale, LDAP...)
- Export des ressources au format texte, chiffré par défaut avec mot de passe personnel
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
```

Configuration
-------------

L'application charge les fichiers de configuration (si ils existent) du dossier `config` dans l'ordre suivant

1. defaults.yaml
2. $(hostname).yaml
3. ${NODE_ENV}.yaml


- Chaque fichier de configuration *écrase* les propriétés du fichier précédemment chargé.
- Le fichier `defaults.yaml` fournit l'ensemble des paramètres de configuration disponibles.
- Vous pouvez surcharger le dossier racine de configuration en passant le paramètre `--configDir <chemin_dossier>` à l'application

Administration
--------------

L'administration de l'application se fait via l'outil en ligne de commande interactif accessible dans le dossier `bin`

**Usage**
```
cd thoth
./bin/thoth <command>
```

*Le mot de passe de chiffrement de la base de données sera demandé à chaque lancement d'une nouvelle commande !*

### Commandes par défaut

- **add-role** Ajoute un des rôles présent dans la configuration à un utilisateur enregistré
- **remove-role** Retire un rôle à un utilisateur

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

Dépendances
-----------

- [NodeJS](http://nodejs.org/)
- [MongoDB](http://www.mongodb.org/)

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