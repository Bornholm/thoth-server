(function(isServer) {

	if(isServer) {
		var _ = require('lodash');
	} else {
		var _ = this._;
	}

	var Hookable = function() {
		this._hooks = {};
	};

	var p = Hookable.prototype;

	function getAfterHooks(id, cb, err) {
		var args = _.toArray(arguments).slice(2);
		err = err || this.applyHooks(id+':after', [args]);
		if(err) return cb(err);
		cb.apply(null, args);
	};

	Hookable.wrapAsync = function(id, fn) {
		return function() {
			var args = _.toArray(arguments);
			var cb = args[args.length-1];
			var self = this;
			try {
				var err = self.applyHooks(id+':before', args);
				if(err) {
					process.nextTick(cb.bind(null, err));
					return self;
				}			
				args[args.length-1] = getAfterHooks.bind(self, id, cb);
				fn.apply(self, args);
			} catch(err) {
				process.nextTick(cb.bind(null, err));
			}
			return self;
		};
	};

	p.hook = function(hookId, callback) {
		var hooksHolder = this._hooks[hookId] = this._hooks[hookId] || [];
		if(typeof callback !== 'function') 
			throw new Error('"callback" parameter should be a function !');
		hooksHolder.push(callback);
		return this;
	};

	p.applyHooks = function(hookId, args) {
		var hook, err;
		var hooksHolder = this._hooks[hookId] = this._hooks[hookId] || [];
		for(var i = 0, len = hooksHolder.length; i < len; ++i) {
			hook = hooksHolder[i];
			err = hook.apply(null, args);
			if(err) return err;
		}
	};

	p.unhook = function(hookId, callback) {
		var hooksHolder = this._hooks[hookId] = this._hooks[hookId] || [];
		if(typeof callback === 'function') {
			var index = hooksHolder.indexOf(callback);
			if(index !== -1) hooksHolder.splice(index, 1);
		} else if(!callback) {
			delete hooks[hookId];
		}
		return this;
	};

	if(isServer) {
		module.exports = Hookable;
	} else {
		this.AppBox.Hookable = Hookable;
	}

}(typeof exports === 'undefined' ? false: true))