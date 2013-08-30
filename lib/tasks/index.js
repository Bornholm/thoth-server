
var tasks = {};

module.exports = exports = {

  getTask: function(taskName) {
    return tasks[taskName];
  },

  registerTask: function(taskName, fn, description) {
    tasks[taskName] = {
      fn: fn,
      description: description || 'No description'
    };
  },

  getAllTasks: function() {
    return Object.keys(tasks)
      .map(function(taskName) {
        var task = {};
        task.name = taskName;
        task.fn = tasks[taskName].fn;
        task.description = tasks[taskName].description;
        return task;
      });
  }

};