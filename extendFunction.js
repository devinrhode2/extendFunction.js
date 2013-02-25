function extendFunction(fnRef, addedFunctionality) {
  var oldOldFn;
  if (Object.prototype.toString.call(fnRef) =='[object String]') {
    var s = fnRef.split('.');
    oldOldFn = window;
    while (s.length) {
      oldOldFn = oldOldFn[s.shift()];
    }
  } else if (Object.prototype.toString.call(fnRef) =='[object Function]') {
    oldOldFn = fnRef;
  }
 
  var newFunc = function() {
    var args = [].slice.call(arguments, 0);
 
    var called = false;
    var oldFunction = function() {
      called = true;
      return oldOldFn.apply(this, [].slice.call(arguments));
    };
 
    var newRet = addedFunctionality.apply(this, args.concat(oldFunction));
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFunction
      var oldRet = oldFunction.apply(this, args);
    }
 
    if (typeof newRet === 'undefined') {
      return oldRet;
    } else {
      return newRet;
    }
  };
 
  if (s.length === 0) {
    eval('window.' + fnRef + ' = ' + newFunc.toString());
  } else {
    return newFunc;
  }
}
