module.exports = exports = function createdAtPlugin (schema, options) {

  schema.add({ createdAt: Date })
  
  schema.pre('save', function (next) {
  	if(!this.createdAt) {
  		this.createdAt = new Date()
  	}
    next()
  })
  
  if (options && options.index) {
    schema.path('createdAt').index(options.index)
  }
  
}