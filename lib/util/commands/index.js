var program = require('commander');

exports.startCli = function() {

  var pkg = require('../../../package.json');

  program
    .version(pkg.version)
  ;

  _registerDefaultCommands();

  program.parse(process.argv);

  if(!program.args.length) {
    program.help();
  }

}

exports.registerCommand = function(command, description, action) {
  program
    .command(command)
    .description(description)
    .action(action.bind(this, program))
  ;
};


var defaultCommands = {
  showHelp: require('./show-help'),
  addUser: require('./add-user')
};

// Private methods

function _registerDefaultCommands() {

  exports.registerCommand(
    'adduser [username] [email] [password]',
    'Ajoute un nouvel utilisateur.',
    defaultCommands.addUser
  );

  exports.registerCommand(
    'help',
    'Affiche l\'aide',
    defaultCommands.showHelp
  );

};
