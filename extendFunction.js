//old history: https://gist.github.com/devinrhode2/5022364
function extendFunction(fnRef, addedFunctionality) {
  var oldOldFn;
  if (Object.prototype.toString.call(fnRef) =='[object String]') {
    oldOldFn = window || global;
    var s = fnRef.split('.');
    while (s.length) {
      oldOldFn = oldOldFn[s.shift()];
    }
  } else if (Object.prototype.toString.call(fnRef) =='[object Function]') {
    oldOldFn = fnRef;
  } else {
    throw new Error('unknown type for first arg to extendFunction');
  }

  var newFunc = function() {
    try {
      var args = [].slice.call(arguments);

      var called = false;
      var oldFunction = function() {
        called = true;
        try {
          return oldOldFn.apply(this, [].slice.call(arguments));
          //could use `args` instead of `arguments`, but then we assume you aren't changing the args
          //and in fact, if you change the args you call oldFunction with, things won't work as expected
        } catch (e) {
          if (Object.prototype.toString.call(oldOldFn) != '[object Function]') {
            throw new Error(
              fnRef + ' is not a function. ' + fnRef + ' toString is:'
              oldOldFn + ' and is of type:' + typeof oldOldFn
            );
          } else {
            throw e;
          }
        }
      };

      var newRet = addedFunctionality.call(this, args, oldFunction);
      if (!called) {
        called = false; // reset in case a function dynamically calls the oldFunction
        var oldRet = oldFunction.apply(this, args);
      }

      if (typeof newRet === 'undefined') {
        return oldRet;
      } else {
        return newRet;
      }
    } catch (e) {
      //probably window.onuncaughtException but maybe not. you can var over it
      if (typeof onuncaughtException !== 'undefined' && Object.prototype.toString.call(onuncaughtException) == '[object Function]') {
        onuncaughtException(e);
      } else {
        typeof console !== 'undefined' && console.warn && console.warn(
          'You should define a window.onuncaughtException handler for exceptions,' +
          ' or use a library like Sheild.js'
        );
        throw e;
      }
    }
  };
 
  if (s && s.length === 0) {
    eval('(window || global).' + fnRef + ' = ' + newFunc.toString());
  } else {
    return newFunc;
  }
}
