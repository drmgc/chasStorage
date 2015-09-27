'use strict';

(function() {
	window.defaultImpl = chasStorage.sal.current.name;
	chasStorage.sal.addImpl({
		name: 'mock',
		isAvailable: function() {
			console.warn('call sal:isAvaiable');
			return true;
		},
		flush: function(storageObj) {
			console.warn('call sal:flush');
		},
		load: function() {
			console.warn('call sal:load');
			return {};
		},
		loadDomData: function() {
			console.warn('call sal:loadDomData');
			return {};
		},
		saveDomData: function(domDataStorageObj) {
			console.warn('call sal:saveDomData');
		},
	});
})();


module('general');

test('chasStorage.setItem', function(assert) {
	chasStorage.sal.setImpl('mock');

	chasStorage.setItem('foo', 56);
	equal(chasStorage.getItem('foo'), 56);
});


module('domData');

test('chasStorage.domData.parseConfigString', function(assert) {
	deepEqual(chasStorage.domData.parseConfigString(''), {
		include: {
			value: true,
			checked: true,
			innerHtml: true,
			visible: true,
		}
	});
	deepEqual(chasStorage.domData.parseConfigString('!*'), {
		include: {
			value: false,
			checked: false,
			innerHtml: false,
			visible: false,
		}
	});
	deepEqual(chasStorage.domData.parseConfigString('!value'), {
		include: {
			value: false,
			checked: true,
			innerHtml: true,
			visible: true,
		}
	});
	deepEqual(chasStorage.domData.parseConfigString('visible !*'), {
		include: {
			value: false,
			checked: false,
			innerHtml: false,
			visible: true,
		}
	});
});
