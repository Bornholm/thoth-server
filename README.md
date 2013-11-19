Thoth
=====

Application de gestion des mots de passe

__/!\ Thoth est actuellement en phase de conception & développement. NE PAS UTILISER EN PRODUCTION !__


Caractéristiques (futures)
--------------------------

- Données chiffrées en base de données (AES256 par défaut)
- Mot de passe de chiffrage non stocké sur le disque (demandé au lancement du serveur uniquement)
- Gestion des droits d'accès via catégories
- Système de plugins
- Différentes méthodes d'authentification (locale, LDAP...)
- API REST

Installation
------------

```
git clone http://forge-dev.in.ac-dijon.fr/git/thoth
cd thoth
npm install
CONFIG_FILE=config/$(hostname).yaml
touch ${CONFIG_FILE} # Remplacer vos paramètres de configuration dans ce fichier
```


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