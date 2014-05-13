module.exports = exports = function lastUpdatePlugin (schema, options) {
	
  schema.add({ lastUpdate: Date })
  
  schema.pre('save', function (next) {
    this.lastUpdate = new Date
    next()
  })
  
  if (options && options.index) {
    schema.path('lastUpdate').index(options.index)
  }
}