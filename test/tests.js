'use strict';

(function() {
	var defaultImpl = 'mock';

	window.resetImpl = function() {
		chasStorage.sal.setImpl(defaultImpl);
	};

	window.mock = {
		callsLog: {},
		callbacks: {},
	};

	chasStorage.sal.addImpl({
		name: 'mock',
		isAvailable: function() {
			mock.callsLog.isAvailable++;
			console.warn('call sal:isAvaiable');
			if (mock.callbacks.isAvailable) {
				return mock.callbacks.isAvailable() || true;
			}
			return true;
		},
		flush: function(storageObj) {
			mock.callsLog.flush++;
			console.warn('call sal:flush');
			if (mock.callbacks.flush) {
				mock.callbacks.flush(storageObj);
			}
		},
		load: function() {
			mock.callsLog.load++;
			console.warn('call sal:load');
			if (mock.callbacks.load) {
				return mock.callbacks.load() || {};
			}
			return {};
		},
		loadDomData: function() {
			mock.callsLog.loadDomData++;
			console.warn('call sal:loadDomData');
			if (mock.callbacks.loadDomData) {
				return mock.callbacks.loadDomData() || {};
			}
			return {};
		},
		saveDomData: function(domDataStorageObj) {
			mock.callsLog.saveDomData++;
			console.warn('call sal:saveDomData');
			if (mock.callbacks.saveDomData) {
				mock.callbacks.saveDomData(domDataStorageObj);
			}
		},
	});

	window.reset = function() {
		chasStorage.flush();
		chasStorage.clear(true);
		resetImpl();
		mock.callsLog = {
			isAvailable: 0,
			flush: 0,
			load: 0,
			loadDomData: 0,
			saveDomData: 0,
		};
		mock.callbacks = {
			isAvailable: null,
			flush: null,
			load: null,
			loadDomData: null,
			saveDomData: null,
		};
		chasStorage.autoFlush = false; // It's default behaviour
	};

	QUnit.moduleStart(function(details) {
		console.log('Module:', details.name, '{');
	});

	QUnit.moduleDone(function(details) {
		console.log('}', details.passed, '/', details.total);
		console.log('');
	});

	QUnit.testStart(function() {
		reset();
	});
	QUnit.testDone(function() {
		reset();
	});

	reset();
})();


module('general');

test('chasStorage.setItem', function() {
	chasStorage.sal.setImpl('mock');

	chasStorage.setItem('foo', 56);
	equal(chasStorage.getItem('foo'), 56);
});

test('chasStorage.getItem', function() {
	chasStorage.sal.setImpl('mock');

	equal(chasStorage.getItem('boo'), null);
	equal(chasStorage.getItem('other', 'default value string'), 'default value string');

	chasStorage.setItem('cs', {foo:['bar', 'baz']});
	deepEqual(chasStorage.getItem('cs'), {foo:['bar', 'baz']});
});

test('chasStorage.autoFlush', function() {
	chasStorage.sal.setImpl('mock');

	chasStorage.autoFlush = true;

	chasStorage.setItem('barzoo', 5478);
	equal(mock.callsLog.flush, 1);

	chasStorage.setItem('hoos', 4377);
	equal(mock.callsLog.flush, 2);

	ok('barzoo' in chasStorage.storage);
	ok('hoos' in chasStorage.storage);

	chasStorage.autoFlush = false;
});

test('chasStorage.delete', function() {
	notOk(chasStorage.delete('not exists value'), 'non-existsing value succsesfuly deleted O_o');

	chasStorage.setItem('exists', 'foo');
	ok(chasStorage.delete('exists'));
});

test('chasStorage.contains', function() {
	notOk(chasStorage.contains('non-contains value'));

	chasStorage.setItem('zohcu', 'chasStorage');
	ok(chasStorage.contains('zohcu'));
});


module('domData');

test('chasStorage.domData.parseConfigString', function() {
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

test('chasStorage.domData.save', function() {
	chasStorage.sal.setImpl('mock');

	var dom = $('#domData-save')[0];

	mock.callbacks.saveDomData = function(storage) {
		ok('save.visible' in storage);
		deepEqual(storage['save.visible'], {visible: false});

		ok('save.text' in storage);
		deepEqual(storage['save.text'], {value: 'foo bar baz'});

		ok('save.text-et-visible' in storage);
		deepEqual(storage['save.text-et-visible'], {value: 'hi', visible: true});

		ok('save.text-empty' in storage);
		deepEqual(storage['save.text-empty'], {});
	};

	chasStorage.domData.save(dom);
});

test('chasStorage.domData.save', function() {
	chasStorage.sal.setImpl('mock');

	var dom = $('#domData-load')[0];

	mock.callbacks.loadDomData = function() {
		return {
			'load.visible': {
				visible: true,
			},
			'load.visible-non': {
				visible: false,
			},
			'load.text': {
				value: 'some text to place',
			},
			'load.text-et-visible': {
				value: 'stext tplace',
				visible: false,
			},
			'load.text-empty': {
				value: 'sotext t place',
				visible: false,
			},
		};
	};

	chasStorage.domData.load(dom);

	notEqual(document.getElementById('load.visible').style.display, 'none');
	equal(document.getElementById('load.visible-non').style.display, 'none');
});
