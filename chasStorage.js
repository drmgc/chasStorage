
(function(root, factory) {
	'use strict';

	if (typeof exports !== 'undefined') {
		// TODO: Implement SAL for Node.js
		throw new Error('SAL for Node.js has not been yet implemented');
	}

	/**
		Common SAL (Storage Abstraction Layer) implementations
	*/
	var salImpls = [];

	/**
		Browser (based on localStorage) implementation
	*/
	salImpls.push((function() {
		var _commonStorageCode = 'chasStorage';
		var _domDataStorageCode = 'chasStorage_domData';
		var available = (function() {
				try {
					return 'localStorage' in root && root.localStorage != null;
				} catch (e) {
					return false;
				}
		});
		var localStorage = root.localStorage;
		return {
			name: 'browser',
			isAvailable: function() {
				return available();
			},
			flush: function(storageObj) {
				if (!available()) { return; }
				localStorage.setItem(_commonStorageCode, JSON.stringify(storageObj));
			},
			load: function() {
				if (!available()) { return {}; }
				return JSON.parse(localStorage.getItem(_commonStorageCode) || '{}');
			},
			loadDomData: function() {
				if (!available()) { return {}; }
				return JSON.parse(localStorage.getItem(_domDataStorageCode) || '{}');
			},
			saveDomData: function(domDataStorageObj) {
				if (!available()) { return; }
				localStorage.setItem(_domDataStorageCode, JSON.stringify(domDataStorageObj));
			},
		};
	})());

	var chasStorage = factory();

	salImpls.forEach(function(i) {
		chasStorage.sal.addImpl(i);
	});

	if (window) {
		chasStorage.sal.setImpl('browser');
	}

	root.chasStorage = chasStorage;
})(this, function() {
	'use strict';

	var chasStorage = {};
	var _storage = {};
	var _autoFlush = false;

	var _salImpls = {};
	var _sal = null;


	chasStorage.sal = {
		get impls() { return _salImpls; },
		get current() { return _sal; },
	};

	/**
		Add custom implementation of SAL (Storage Abstraction Layer)
		Every implementation must be object with:
			name - String
				Name of implementation (must be unique)

			isAvailbale() -> Boolean
				Check is this implementation available

			flush(storageObj)
				Flush storage's data

			load() -> object
				Load storage's data

			loadDomData() -> object
				Load domData-storage's data

			saveDomData(domDataStorage)
				Save domData-storage's data
	*/
	chasStorage.sal.addImpl = function(impl) {
		var checkProperty = function(prop, type) {
			if (!impl.hasOwnProperty(prop)) {
				throw new Error('Implementation has no ' + type + ' ' + prop);
			}
			if (typeof impl[prop] != type) {
				throw new Error('Implementation\'s field ' + prop + ' must be ' + type);
			}
		};
		checkProperty('name', 'string');
		if (_salImpls.hasOwnProperty(impl.name)) {
			throw new Error('Implementation ' + impl.name + ' is already exists');
		}
		checkProperty('isAvailable', 'function');
		checkProperty('flush', 'function');
		checkProperty('load', 'function');
		checkProperty('loadDomData', 'function');
		checkProperty('saveDomData', 'function');
		_salImpls[impl.name] = impl;
	};

	/**
		Set current implementation (only if added via addImpl)
	*/
	chasStorage.sal.setImpl = function(name) {
		var name = '' + name;
		if (!_salImpls.hasOwnProperty(name)) {
			throw new Error('Implementation ' + name + ' not found');
		}
		_sal = _salImpls[name];
	};

	chasStorage.sal.addImpl({
		name: 'empty',
		isAvailable: function() { return false; },
		flush: function(storageObj) {},
		load: function() { return {}; },
		loadDomData: function() { return {}; },
		saveDomData: function(domDataStorageObj) {},
	});
	chasStorage.sal.setImpl('empty');


	/**
		Check is SAL available
	*/
	Object.defineProperty(chasStorage, 'available', {
		get: function() {
			return _sal.isAvailable();
		}
	});


	/**
		Currently used implementation of SAL
	*/
	Object.defineProperty(chasStorage, 'salImplementation', {
		get: function() {
			return _sal;
		}
	});


	/**
		Enable autoflush-mode.
		If enabled, after every change of storage it will be flushed.
	*/
	Object.defineProperty(chasStorage, 'autoFlush', {
		get: function() {
			return _autoFlush;
		},
		set: function(value) {
			_autoFlush = !!value;
		}
	});


	/**
		Contents of storage
	*/
	Object.defineProperty(chasStorage, 'storage', {
		get: function() {
			return _storage;
		}
	});


	/**
		Load storage via SAL
	*/
	chasStorage.load = function() {
		_storage = _sal.load();
	};


	/**
		Save storage via SAL
	*/
	chasStorage.flush = function() {
		_sal.flush(_storage);
	};


	/**
		Get value from storage
		@param name the name of value
		@param [defaultValue=null] default value
		@returns value if found else defaultValue
	*/
	chasStorage.getItem = function(name, defaultValue) {
		if (name in _storage) {
			return _storage[name];
		} else {
			return defaultValue || null;
		}
	};


	/**
		Установить значение переменной
		Store or update value in storage
		@param name the name of value
		@param value value to be stored
		@param [allowRewrite=true] is rewriting allowed (aka only-storing-mode)
		@returns true if value successfully stored (always true if allowRewrite=true)
	*/
	chasStorage.setItem = function(name, value, allowRewrite) {
		if (allowRewrite !== undefined && !allowRewrite && name in _storage) {
			return false;
		}
		_storage[name] = value;
		if (_autoFlush) {
			chasStorage.flush();
		}
		return true;
	};


	/**
		Remove value from storage
		@param name the name of value
		@returns true if removed, false if value didn't exists
	*/
	chasStorage.delete = function(name) {
		if (name in _storage) {
			delete _storage[name];
			return true;
		} else {
			return false;
		}
	};


	/**
		Check is value in storage
		@param name name of value
		@returns is value found in storage
	*/
	chasStorage.contains = function(name) {
		return name in _storage;
	};


	/**
		Remove all values from storage
		@param [flush=false] flush after removing
	*/
	chasStorage.clear = function(flush) {
		_storage = {};
		if (flush) {
			chasStorage.flush();
		}
	};


	/**
		Saving/restroing states from DOM elements.
		Every DOM element, that have attribute with name from chasStorage.domData.idAttribute will be saved to storage.
		Some states can be excluded via attribute with name from chasStorage.data.confAttribute. (See chasStorage.domData.parseConfigString for more info)
	*/
	chasStorage.domData = {};
	chasStorage.domData.idAttribute = 'data-chasstorage-id';
	chasStorage.domData.confAttribute = 'data-chasstorage-conf';


	/**
		Parse config attribute.
		Syntax:
			Those words with '!' sign at begining means exclude:
				value — include value of field (for textareas, entries etc.)
				checked — include is checked (for checkboxes)
				innerHtml — include innerHtml
				visible — include is style.display != 'none'
			!* — exclude everything by default
	*/
	chasStorage.domData.parseConfigString = function(str) {
		var excludeByDefault = /(\s|^)\!\*(\s|$)/.test(str);
		var isIncluded = function(prop) {
			var re = new RegExp('(\\s|^)' + prop + '(\\s|$)', 'i');
			var nre = new RegExp('(\\s|^)\!' + prop + '(\\s|$)', 'i');
			if (excludeByDefault) {
				return re.test(str);
			} else {
				return !nre.test(str);
			}
		};
		return {
			include: {
				value: isIncluded('value'),
				checked: isIncluded('checked'),
				innerHTML: isIncluded('innerHtml'),
				visible: isIncluded('visible'),
			}
		};
	};


	/**
		Save states of DOM elements
	*/
	chasStorage.domData.save = function(domElement) {
		if (!chasStorage.available) {
			return;
		}

		var _domDataStorage = _sal.loadDomData();
		var hndl = function(el) {
			var id = el.getAttribute(chasStorage.domData.idAttribute);
			var conf = chasStorage.domData.parseConfigString(el.getAttribute(chasStorage.domData.confAttribute) || '');

			var stor = _domDataStorage[id];
			if (!stor) {
				_domDataStorage[id] = {};
				stor = _domDataStorage[id];
			}
			if ('value' in el && conf.include.value) {
				stor.value = el.value;
			}
			if ('checked' in el && conf.include.checked) {
				stor.checked = el.checked;
			}
			if ('innerHTML' in el && conf.include.innerHTML) {
				stor.innerHTML = el.innerHTML;
			}
			if (conf.include.visible) {
				stor.visible = (el.style.display != 'none');
			}
		};

		[].slice.call((domElement || document).querySelectorAll('*[' + chasStorage.domData.idAttribute + ']'), 0).map(hndl);

		_sal.saveDomData(_domDataStorage);
	};


	/**
		Load and store states of DOM elements
	*/
	chasStorage.domData.load = function(domElement) {
		if (!chasStorage.available) {
			return;
		}

		var _domDataStorage = _sal.loadDomData();
		var hndl = function(el) {
			var id = el.getAttribute(chasStorage.domData.idAttribute);
			var conf = chasStorage.domData.parseConfigString(el.getAttribute(chasStorage.domData.confAttribute) || '');

			var stor = _domDataStorage[id];
			if (!stor) {
				stor = {};
			}
			if (stor.hasOwnProperty('value') && conf.include.value) {
				el.value = stor.value;
			}
			if (stor.hasOwnProperty('checked') && conf.include.checked) {
				el.checked = stor.checked;
			}
			if (stor.hasOwnProperty('innerHTML') && conf.include.innerHTML) {
				el.innerHTML = stor.innerHTML;
			}
			if (stor.hasOwnProperty('visible') && conf.include.visible && !stor.visible) {
				el.style.display = 'none';
			}
		};

		[].slice.call((domElement || document).querySelectorAll('*[' + chasStorage.domData.idAttribute + ']'), 0).map(hndl);
	};


	Object.defineProperty(chasStorage.domData, 'storage', {
		get: function() {
			return _sal.loadDomData();
		}
	});


	return chasStorage;
});
