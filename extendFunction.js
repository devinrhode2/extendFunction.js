/*!
 * extendFunction.js - The easiest way to other functions with additional functionality
 *
 * github.com/devinrhode2/extendFunction.js
 *
 * Copyright (c) 2013 extendFunction.js contributors
 * MIT Licensed
 */
function extendFunction(fnPropertyRef, addedFunctionality) {
  // not doing 'use strict' because it changes what `this` means, and extendFunction
  // should be as seamless as possible
  // http://scriptogr.am/micmath/post/should-you-use-strict-in-your-production-javascript
  // however, if a global 'use strict' is leaked, you can expect we just use the `this`
  // keyword.. (I wish I could solve your bugs for you, but I can't here)

  var undefined;

  // type check just like underscore/lodash
  if (Object.prototype.toString.call(fnPropertyRef) == '[object String]') {

    // Example: split 'jQuery.ajax' into ['jQuery', 'ajax']
    var propertyArray = fnPropertyRef.split('.');

    // start with the global object, and iteratively access each property,
    // re-assigning to oldFn each time
    // Example:
    //   oldFn = window; oldFn = oldFn[prop]; oldFn = oldFn[prop];
    // Aka:
    //  oldFn = window.jQuery.ajax;
    var oldFn = (typeof window !== 'undefined' ? window : global);

    // so while there are properties left to access..
    while (propertyArray.length) {
      try {
        oldFn = oldFn[propertyArray.shift()];
        // Why not just .pop or .shift ?
        // Well, if oldFn[propArray[0]]       is      undefined,
        // then     oldFn[propArray[0]][propArray[1]] will throw an error because this is essentially doing window.undefined.undefined
        // When oldFn.undefined.undefined throws an exception, oldFn still just === undefined (ultimately probably from oldFn.someUndefinedPropery)
        //
        // ...but don't we want to prevent having oldFn.undefined?
        // not here.
        // We'll assume people have good input, but catch the exception below when it happens.
      } catch (readPropOfUndefinedError) {
        if (oldFn === undefined) {
          throw new Error('window.' + fnPropertyRef + ' is undefined and therefore cannot be extended as a function.');
        } else {
          // ...who knows what happened!
          throw readPropOfUndefinedError;
        }
      }
    }
  } else {
    // else fnPropertyRef is actually the oldFn, or at least we'll assume so and catch the error if it isn't
    oldFn = fnPropertyRef;
  }

  function extendedFunction() {
    var args = Array.prototype.slice.call(arguments); // we use Array.prototype.slice instead of [].slice because it doesn't allocate a new array

    // extend oldFn to track if it was called
    var called = false;
    var orig_oldFn = oldFn;
    oldFn = function () {
      called = true;
      try {
        // should we store this above and then use that variable? I don't know
        return orig_oldFn.apply(this, Array.prototype.slice.call(arguments));
        // we use standard dynamic `arguments` instead of `args` because there are not necessarily always the same
        // if a user modifies the arguments they call originalFunction with (extendFunction(function(args, originalFunction){ .. ) then we have to respect that
      } catch (e) {
        // above we assumed oldFn is a function if it's not a string (for efficiency) - here, we catch and correct if it wasn't a function.
        // yes, it's more efficient to originally assume it's a function
        if (Object.prototype.toString.call(orig_oldFn) != '[object Function]') {
          throw new Error(fnPropertyRef + ' is not a function. ' + fnPropertyRef + ' toString is:' +
                          orig_oldFn + ' and is of type:' + typeof orig_oldFn);
        } else {
          throw e;
        }
      }
    };

    var modifiedThis = this;
    var callOldFn = true;
    function iWillCallOldFn() {
      callOldFn = false; //don't call oldFn
    }
    // PROPOSAL: api for telling extendFunction not to call the oldFunction itself,
    // because the users additionalFunctionality will call it asynchronously
    modifiedThis.iWillCallOldFn = iWillCallOldFn;
    var oldRet;
    var newRet = addedFunctionality.call(modifiedThis, args, oldFn);
    if (!called) {
      called = false; // reset in case a function dynamically calls the oldFn
      if (callOldFn) {
        oldRet = oldFn.apply(this, args);
      }
    }

    if (newRet === undefined) {
      return oldRet;
    } else {
      return newRet;
    }
  }

  if (propertyArray && propertyArray.length === 0) {
    eval('(typeof window !== "undefined" ? window : global).' + fnPropertyRef + ' = ' + extendedFunction.toString());
  } else {
    return extendedFunction;
  }
}

if (typeof module !== 'undefined') {
  module.exports = extendFunction;
}
