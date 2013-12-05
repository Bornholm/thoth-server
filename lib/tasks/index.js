
var namespaces = {};

module.exports = exports = {

  getTask: function(ns, taskName) {
    return (namespaces[ns] || {})[taskName];
  },

  registerTask: function(ns, taskName, fn, description) {
    var nsTasks = namespaces[ns] = namespaces[ns] || {};
    nsTasks[taskName] = {
      fn: fn,
      description: description
    };
  },

  pad: function(str, width) {
    var len = Math.max(0, width - str.length);
    return str + Array(len + 1).join(' ');
  },

  getLargestCommandLength: function(tasks) {
    return tasks.reduce(function(max, task) {
      return Math.max(max, task.name.length);
    }, 0);
  },

  showHelp: function() {
    var width = exports.getLargestCommandLength(exports.getAllTasks());
    console.log('  ' + 'Commands:');
    console.log();
    exports.getAllNamespaces()
      .reverse()
      .forEach(function(namespace) {
        console.log('    ' + namespace);
        exports.getAllTasks(namespace)
          .forEach(function(task) {
            console.log(
              '      ' +
              exports.pad(task.name, width) + '\t' + task.description
            );
          });
        console.log();
      });
    console.log();
  },

  getNamespace: function(ns) {
    return (namespaces[ns] = namespaces[ns] || {});
  },

  getAllNamespaces: function() {
    return Object.keys(namespaces);
  },

  getAllTasks: function(namespace) {
    if(!namespace) {
      return exports.getAllNamespaces()
        .reduce(function(result, ns) {
          result.push.apply(result, exports.getAllTasks(ns));
          return result;
        }, []);
      return tasks;
    } else {
      var ns = exports.getNamespace(namespace);
      return Object.keys(ns)
        .map(function(taskName) {
          var task = {};
          task.name = taskName;
          task.fn = ns[taskName].fn;
          task.description = ns[taskName].description;
          return task;
        });
    }
  }

};