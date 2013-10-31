var async = require('async');

module.exports = function(pluginOpts, api, client) {

  api.tasks.registerTask(
    'ldap:search-dn',
    function(app, program)  {
      
      app.logger.info('Searching LDAP for user\'s DN');

      async.waterfall([
        function askFilter(next) {
          program.prompt('Please enter your filter: ', next.bind(null, null));
        },
        function doSearch(filter, next) {

          var dn = pluginOpts.dn;
          var scope = pluginOpts.scope;
          var opts = {
            filter: filter,
            scope: scope
          };

          client.search(dn, opts, function(err, res) {

            if(err) {
              return cb(err);
            }

            res.once('searchEntry', function(entry) {
              api.logger.info('LDAP Entry', {dn: entry.object.dn});
            });
            res.once('error', next);
            res.once('end', next.bind(null, null));

          });
          
        }
      ], function(err) {

        if(err) {
          api.logger.error(err.stack);
          return process.exit(1);
        }

        app.logger.info('Done !');
        return process.exit();

    });


    },
    'Search LDAP for user\'s DN'
  );

};