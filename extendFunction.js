/*!
 * extendFunction.js - The easiest way to other functions with additional functionality
 *
 * github.com/devinrhode2/extendFunction.js
 *
 * Copyright (c) 2013 extendFunction.js contributors
 * MIT Licensed
 */
(function(window, undefined){
  function extendFunction(fnPropertyRef, addedFunctionality) {
    // not doing 'use strict' because it changes what `this` means, and extendFunction
    // should be as seamless as possible
    // http://scriptogr.am/micmath/post/should-you-use-strict-in-your-production-javascript
    // however, if a global 'use strict' is leaked, you can expect we just use the `this`
    // keyword.. (I wish I could solve your bugs for you, but I can't here)

    var userFn;

    // type check like underscore/lodash
    if (Object.prototype.toString.call(fnPropertyRef) == '[object String]') {

      // Example: split 'jQuery.ajax' into ['jQuery', 'ajax']
      var propertyArray = fnPropertyRef.split('.');

      // start with the global object, and iteratively access each property,
      // re-assigning to userFn each time
      // For example, this dynamic code:
      //  userFn = window; userFn = userFn[prop]; userFn = userFn[nextProp]; ..
      // Could ultimately boil down to this static code:
      //  userFn = window.$.fn.jQueryPluginFunction;
      userFn = window;

      // so while there are properties left to access..
      while (propertyArray.length) {
        try {
          userFn = userFn[propertyArray.shift()];
          //  if  userFn[propArray[0]]       is      undefined,
          // then userFn[propArray[0]][propArray[1]] will throw because this is essentially doing window.undefined.undefined
        } catch (cantReadPropOfUndefined) {
          // And now we've caught that exception. userFn should still just === undefined (essentially like window.undefined aka userFn.notDefinedProperty)
          if (userFn === undefined) {
            // ...but don't we want to prevent having userFn.undefined in the first place?
            // Nope, we just assume good input for efficiency, but catch the exception here when it happens.
            throw new TypeError('window.' + fnPropertyRef + ' is undefined and therefore cannot be extended as a function.');
          } else {
            // ...who knows what happened!
            throw cantReadPropOfUndefined;
          }
        }
      }
    } else {
      // else fnPropertyRef is actually the userFn, or at least we'll assume so and catch the error if it isn't
      userFn = fnPropertyRef;
    }

    //userFn should now be a function. (If it isn't we'll catch that error specifically)

    function extendedFunction() {
      var args = Array.prototype.slice.call(arguments); // we use Array.prototype.slice instead of [].slice because it doesn't allocate a new array

      // extend userFn to track if it was called
      var called = false;
      var orig_userFn = userFn;
      userFn = function () {
        called = true;
        try {
          // should we store this above and then use that variable? I don't know
          return orig_userFn.apply(this, Array.prototype.slice.call(arguments));
          // we use standard dynamic `arguments` instead of `args` because there are not necessarily always the same
          // if a user modifies the arguments they call originalFunction with (extendFunction(function(args, originalFunction){ .. ) then we have to respect that
        } catch (e) {
          // above we assumed userFn is a function if it's not a string (for efficiency) - here, we catch and correct if it wasn't a function.
          // yes, it's more efficient to originally assume it's a function
          if (Object.prototype.toString.call(orig_userFn) != '[object Function]') {
            throw new TypeError(fnPropertyRef + ' is not a function. ' + fnPropertyRef + ' toString value is:' +
                            orig_userFn + ' and is of type:' + typeof orig_userFn);
          } else {
            fireUncaughtExcepton(e);
          }
        }
      };

      var modifiedThis = this;
      var calluserFn = true;
      function iWillCalluserFn() {
        calluserFn = false; //don't call userFn
      }
      // PROPOSAL: api for telling extendFunction not to call the oldFunction itself,
      // because the users additionalFunctionality will call it asynchronously
      modifiedThis.iWillCalluserFn = iWillCalluserFn;
      var oldRet;
      var newRet = addedFunctionality.call(modifiedThis, args, userFn);
      if (!called) {
        called = false; // reset in case a function dynamically calls the userFn
        if (calluserFn) {
          oldRet = userFn.apply(this, args);
        }
      }

      if (newRet === undefined) {
        return oldRet;
      } else {
        return newRet;
      }
    }

    // Preserve function.length since extendedFunction doesn't list arguments!
    extendedFunction.length = userFn.length;
    // Maintain prototype chain..
    extendedFunction.prototype = userFn.prototype;
    //TODO: I'm not sure if someone does `new extendedFunction(..)` nothing different will happen

    // Maintain constructor property
    extendedFunction.constructor = userFn.constructor;

    // Ensure all properties are copied over..
    for (var prop in userFn) {
      if (Object.prototype.hasOwnProperty.call(userFn, prop)) {
        extendedFunction[prop] = userFn[prop];
      }
    }

    if (propertyArray && propertyArray.length === 0) {
      eval('(typeof window !== "undefined" ? window : global).' + fnPropertyRef + ' = ' + extendedFunction.toString());
    } else {
      return extendedFunction;
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = window.extendFunction;
  }
})( this );