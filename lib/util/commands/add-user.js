var Promise = require('bluebird');
var inquirer = require('inquirer');
var bcrypt = require('bcrypt');
var config = require('../config');
var User = require('../../models').User;

var hash = Promise.promisify(bcrypt.hash, bcrypt);
var rounds = config.get('accounts:passwordHashRounds');

// TODO vérifier les entrées utilisateur
// TODO vérifier que l'email n'est pas déjà présent dans la BDD

module.exports = function addUser(program, username, email, password) {

  Promise.resolve()
    .bind(this)
    .then(function() {
      // On récupère le nom d'utilisateur & le mot de passe si non renseignés
      return new Promise(function(resolve) {

        var questions = [
          {
            type: 'input',
            name: 'username',
            message: 'Enter username:',
            when: function() { return !username; }
          },
          {
            type: 'input',
            name: 'email',
            message: 'Enter email:',
            when: function() { return !email; }
          },
          {
            type: 'password',
            name: 'password',
            message: 'Enter password:',
            when: function() { return !password; }
          }
        ];

        inquirer.prompt(questions, function(answers) {
          return resolve({
            name: answers.username || username,
            email: answers.email || email,
            password: answers.password || password
          });
        });

      })

    })
    .then(function(credentials) {

      // Hachage du mot de passe
      return hash(credentials.password, rounds)
        .then(function(hash) {
          delete credentials.password;
          credentials.password_hash = hash;
          return credentials;
        })
      ;

    })
    .then(function(credentials) {
      // Création du nouvel utilisateur
      var user = new User(credentials);
      return user.save();
    })
    .then(function() {
      console.log('Utilisateur créé.');
      process.exit(0);
    })
  ;

};
