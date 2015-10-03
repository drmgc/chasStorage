# chasStorage

Cross-browser key-value store database.

*chasStorage* is a lightweight replacement of [jStorage](http://www.jstorage.info/) that also contain some additional features.

## Install

Download [chasStorage.js](https://github.com/DrMGC/chasStorage/blob/master/chasStorage.js)

## Usage (basic API)
**Attention:** *You must call `chasStorage.load()` manually!*

### getItem(name[, defaultValue])
Get value from storage

* **name** - the name of the value
* [**defaultValue**] -  the defaultValue (if value not in storage). Default: `null`

**Returns:** value, if found, else `defaultValue`

```javascript
chasStorage.getItem('foo.bar.baz')
chasStorage.getItem(7577, 'lorem ipsum')
```

### setItem(name, value[, allowRewrite])
Store value in storage

* **name** - the name of the value
* **value** - value itself
* [**allowRewrite**] - flag: is rewrite is allowed (i.e. if value is already in storage then it won't be changed). Default: `true`

**Returns:** is value setted (if `allowRewrite == true`, always `true`)

```javascript
chasStorage.setItem('foo', 56)
chasStorage.setItem('unique value', 'ipsum lorem', false)
```

### delete(name)
Remove value form storage

* **name** - the name of the value

**Returns:** is value were exist

```javascript
chasStorage.delete('foo')
```

### contains(name)
Check is value in storage

* **name** - the name of the value

**Returns:** does storage contain value?

```javascript
if (chasStorage.contains('foo')) {
	console.log('key "foo" exists');
}
```

### clear([flush])
Remove all items from storage

**NOTE:** *It ignore `autoFlush`-flag*

* **flush** - flag to flush after clear. Default: `false`

```javascript
chasStorage.clear();
```

### load()
Load data

```javascript
chasStorage.load();
```

### flush()
Save data

```javascript
chasStorage.flush();
```

### autoFlush
Flag of autoFlush-mode:
Call `chasStorage.flush()` after every change.

Default: `false`

### storage
Contents of storage.

### available
**READONLY**

Is chasStorage available. 

## Usage of domData-extension
**Attention:** *`domData` is not depended on basic API of `chasStorage`*

Using this extension you can save state of elements (of whole page or concrete DOM element) to storage.

`domData` handling every element with attribute `data-chasstorage-id` (you can change this name via `domData.idAttriubte`).

In `data-chasstorage-id` stored id of this element's record. In optional attribute `data-chasstorage-conf` you can specify things must be saved.

### Syntax of `data-chasstorage-conf`
Those words with `!` means exclude, else include:

* `value` - value of element (only for inputs)
* `checked` - is checkbox checked (only for checkboxes)
* `innerHtml` - innerHtml of DOM element
* `visible` - is `style.display != 'none'`

Also you can exclude every thing by default with `!*`.

Priority of lexems:

1. `!lexem`
2. `lexem`
3. `!*`

### domData.idAttribute
ID attribute

Default: `data-chasstorage-id`

### domData.confAttribute
Configuration attribute

Default: `data-chasstorage-conf`

### domData.load([domElement])
Load values to elements of domElement

* [**domElement**] - element of DOM. Default: `document`

```javascript
chasStorage.domData.load()
chasStorage.domData.load(document.getElementById('text-areas'))
```

### domData.save([domElement])
Save values of elements of domElement

* [**domElement**] - element of DOM. Default: `document`

```javascript
chasStorage.domData.save()
chasStorage.domData.save(document.getElementById('some-id'))
```

## License

[Unlicense](http://unlicense.org/)
