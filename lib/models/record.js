var mongoose = require('mongoose');
var lastUpdate = require('./plugins/last-update');
var creationDate = require('./plugins/creation-date');
var encrypt = require('./plugins/encrypt');
var without = require('./plugins/without');
var revision = require('./plugins/revision');
var Schema = mongoose.Schema;
var Types = Schema.Types;


// Définition du schéma d'un Record
var schema = new Schema({

	label: {
    type: String,
    unique: true
  },

	category: {
    type: [String],
    required: true
  },

  tags: {
    type: [String]
  },

	text: String,

	creator: {
		type: Types.ObjectId,
		required: true,
		ref: 'User'
	}

});

// Retourne les catégories "englobantes" du Record
schema.methods.getIncludingCategories = function() {
  var categories = [];
  var i = this.category.length;
  do {
    var cat = this.category.slice(0, i);
    if(cat.length) {
      categories.push(cat);
    }
  } while(i--);
  return categories;
};

// Ajout automatique de la date de création et de modification
schema.plugin(lastUpdate, {index: true});
schema.plugin(creationDate, {index: true});

// Ajout de la méthode utilitaire "without()"
// permettant d'exporter une copie du modèle
// en excluant certaines propriétés (ex: auth)
schema.plugin(without);

// Gestion des "révisions"
schema.plugin(revision);

// Chiffrage automatique du champ "text"
schema.plugin(encrypt, {
	fields: ['text']
});


module.exports = exports = mongoose.model('Record', schema);