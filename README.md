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
localFunction = extendFunction(localFunction, function(args, originalLocalFunction) {
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

Or promises:
```javascript
extendFunction('$.ajax', function(args, prevFunc) {
  var stackOnSend = new Error().stack;

  //prevFunc is the original $.ajax
  //call that and store the value to return
  var ret = prevFunc.apply(this, args);
  ret.fail = extendFunction(ret.fail, function(args) {
    if (offlineArgs(args)) {
      //ignore, failure b/c of being offline
    } else {
      //report
      var e = new Error(args[0]);
      e.stack = stackOnSend;
      onuncaughtException(e);
    }

    //nothing returned, so extendFunction calls
    //the original fail function and returns
    //the value returned from it
  });
  return ret;
});
```

MIT licensed
