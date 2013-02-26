extendFunction.js
=================

The easiest way to overwrite other functions with additional functionality
 
Example:
Let's modify alert to keep a history array of the logs:
```javascript
window.alertHistory = [];
extendFunction('alert', function(message) {
  alertHistory.push(message);
});
```

Test it:
```javascript
alert('a message');
if (alertHistory[0] === 'a message') {
  alert('oh geez this function is powerful!');
}
```

Now let's add ' from DevinRhode2' to every alert message
```javascript
extendFunction('alert', function(message, nativeAlert) {
  //...
  nativeAlert(message + ' from DevinRhode2')
});
```
Works for methods too:
```javascript
extendFunction('console.log', function(message){
  //omg console.log was called!
});
```
 
For non-global functions, you assign back like this:
```javascript
localFunction = extendFunction(localFunction, function(arg1, arg2, originalLocalFunction){
  //magic!
});
```
 
Modify return values:
```javascript
extendFunction('strangeModule.strangeMethod', function(options, etc) {
  //convert arguments object into real array
  var args = [].slice.call(arguments);
 
  //the last arg is the old strangeMethod. pop() that method off the args array and .apply with the proper args!
  var returnValue = args.pop().apply(this, args);
 
  returnValue.extraInfo = 'idk';
  return returnValue;
});
```

MIT licensed
