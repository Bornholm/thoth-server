module.exports = exports = function creationDatePlugin (schema, options) {

  schema.add({ creationDate: Date })
  
  schema.pre('save', function (next) {
  	if(!this.creationDate) {
  		this.creationDate = new Date()
  	}
    next()
  })
  
  if (options && options.index) {
    schema.path('creationDate').index(options.index)
  }
  
}