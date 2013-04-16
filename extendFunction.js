//old history: https://gist.github.com/devinrhode2/5022364
function extendFunction(fnRef, addedFunctionality) {
  var undefined;
  var oldOldFn, s;
  if (Object.prototype.toString.call(fnRef) =='[object String]') {
    oldOldFn = window || global;
    s = fnRef.split('.');
    while (s.length) {
      oldOldFn = oldOldFn[s.shift()];
      if (oldOldFn === undefined) {
        throw new Error(
          'Can\'t extend function ' + fnRef + ' because ' +
          fnRef.replace(s.join('.'), '').replace(/(\.$)/g, '') + ' is not defined'
        );
      }
    }
    //we'll assume oldOldFn really is a function, and catch the error if there is one
  } else if (Object.prototype.toString.call(fnRef) =='[object Function]') {
    oldOldFn = fnRef;
  } else {
    throw new Error('unknown type for first arg of extendFunction');
  }

  function extendedFunc() {
    var args = [].slice.call(arguments);

    var called = false;
    function oldFunction() {
      called = true;
      try {
        return oldOldFn.apply(this, [].slice.call(arguments));
        //could use `args` instead of `arguments`, but then we assume you aren't changing the args
        //and in fact, if you change the args you call oldFunction with, things won't work as expected
      } catch (e) {
        if (Object.prototype.toString.call(oldOldFn) != '[object Function]') {
          throw new Error(fnRef + ' is not a function. ' + fnRef + ' toString is:' +
                          oldOldFn + ' and is of type:' + typeof oldOldFn);
        } else {
          throw e;
        }
      }
    }
    
    var oldRet;
    var newRet = addedFunctionality.call(this, args, oldFunction);
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFunction
      oldRet = oldFunction.apply(this, args);
    }

    if (typeof newRet === 'undefined') {
      return oldRet;
    } else {
      return newRet;
    }
  }
 
  if (s && s.length === 0) {
    eval('(window || global).' + fnRef + ' = ' + extendedFunc.toString());
  } else {
    return extendedFunc;
  }
}
