extendFunction.js
=================

The easiest way to overwrite other functions with additional functionality
 
Example:
Let's modify alert to keep a history array of the logs:
```javascript
window.alertHistory = [];
extendFunction('alert', function(args) {
  var message = args[0];
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
extendFunction('alert', function(args, nativeAlert) {
  //...
  nativeAlert(message + ' from DevinRhode2')
});
```
Works for methods too:
```javascript
extendFunction('console.log', function(args, nativeConsoleLog) {
  //omg console.log was called!
});
```
 
For non-global functions, you assign back like this:
```javascript
localFunction = extendFunction(localFunction, function(args, originalLocalFunction){
  //your magic here!
});
```
 
Modify return values:
```javascript
extendFunction('strangeModule.strangeMethod', function(args, prevFunc) {
  var returnValue = prevFunc.apply(this, args);

  returnValue.extraInfo = 'idk';
  return returnValue;
});
```

MIT licensed
