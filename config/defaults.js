
// /!\ NE PAS MODIFIER /!\

// Fichier de configuration par défaut.
// Voir le fichier README.md pour savoir comment personnaliser les paramètres
// de votre installation.

// -----------------------------------------------------------------------------

// Paramètres de configuration du serveur Web

exports.server = {
  port: 8080, // Port
  host: 'localhost' // Adresse (mettre '0.0.0.0' pour écouter sur toutes les adresses)
};

// Paramètre de connexion à la base de données, voir http://knexjs.org/

exports.database = {
  client: 'sqlite3', // Driver à utiliser
  connection: { // Paramètres de configuration du driver
    filename: './data.sqlite3'
  }
};

// Paramètres de chiffrement des données

exports.encryption = {
  algorithm: 'aes256', // Algorithme de chiffrement
  hmacPath: '.hmac' // Chemin d'accès au fichier de vérification de la phrase secrète
};

// Paramètres de gestion des comptes utilisateurs

exports.accounts = {
  passwordHashRounds: 13 // Nombre de hachages du mot de passe avant stockage
};

// Paramètres de configuration du logger

exports.logger = {
  name: 'Thoth',
  level: 'info'
};
