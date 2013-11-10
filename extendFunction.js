/*!
 * extendFunction.js - The easiest way to overwrite other functions with additional functionality
 *
 * github.com/devinrhode2/extendFunction.js
 *
 * Copyright (c) 2013 extendFunction.js contributors
 * MIT Licensed
 */
(function(window, undefined){
  // window refers to the global `this`.
  // This function should work fine in node.
  function extendFunction(fnRef, addedFunctionality) {
    // not doing 'use strict' because it changes what `this` means, and extendFunction
    // should be as seamless as possible
    // http://scriptogr.am/micmath/post/should-you-use-strict-in-your-production-javascript
    // however, if a global 'use strict' is leaked, you can expect we just use the `this`
    // keyword.. (I wish I could solve your bugs for you, but I can't here)

    var originalFunction;

    // type check like underscore/lodash.
    // (..advanced: we could assume it's a function and course-correct if it's a string, but that's a little gnarly for a prime use case)
    if (Object.prototype.toString.call(fnRef) == '[object String]') {

      // Example: split 'jQuery.ajax' into ['jQuery', 'ajax']
      var propertyArray = fnRef.split('.');

      // start with the global object, and iteratively access each property,
      // re-assigning to originalFunction each time
      // For example, this dynamic code:
      //  originalFunction = window; originalFunction = originalFunction[prop]; originalFunction = originalFunction[nextProp]; ..
      // Could ultimately boil down to this static code:
      //  originalFunction = window.$.fn.jQueryPluginFunction;
      originalFunction = window;

      // so while there are properties left to access..
      while (propertyArray.length) {
        try {
          originalFunction = originalFunction[propertyArray.shift()];

          //  if  originalFunction[propArray[0]]       is      undefined,
          // then originalFunction[propArray[0]][propArray[1]] will throw because this is essentially doing window.undefined.undefined
        } catch (cantReadPropOfUndefined) {
          // And now we've caught that exception. originalFunction should still just === undefined (essentially like window.undefined aka originalFunction.notDefinedProperty)
          if (originalFunction === undefined) {
            // ...but don't we want to prevent having originalFunction.undefined in the first place?
            // Nope, we just assume good input for efficiency, but catch the exception here when it happens.
            throw new TypeError('window.' + fnRef + ' is undefined and therefore cannot be extended as a function.');
          } else {
            // ...who knows what happened!
            throw cantReadPropOfUndefined;
          }
        }
      }
    } else {
      // else fnRef is actually the originalFunction, or at least we'll assume so and catch the error if it isn't
      originalFunction = fnRef;
    }

    //originalFunction should now be a function. (If it isn't we'll catch that error specifically)

    function extendedFunction() {
      // TODO: write a test that verifies `this` refers to what it should refer too.
      // For example, if you do extendFunction('$.ajax', function(){ this === window.$; });
      var args = Array.prototype.slice.call(arguments);

      // EXTEND originalFunction TO TRACK IF IT WAS CALLED
      var wasOriginalCalled = false;
      var untrackedOriginal = originalFunction;
      originalFunction = function () {
        wasOriginalCalled = true;
        try {
          // should we store this above and then use that variable? I don't know
          return untrackedOriginal.apply(this, Array.prototype.slice.call(arguments));
          // we use standard dynamic `arguments` instead of `args` because there are not necessarily always the same
          // if a user modifies the arguments they call originalFunction with (extendFunction(function(args, originalFunction){ .. ) then we have to respect that
        } catch (e) {
          // above we assumed originalFunction was a function if it wasn't a string (for efficiency) - here, we catch and correct if it wasn't a function.
          if (Object.prototype.toString.call(untrackedOriginal) != '[object Function]') {
            // to throw or not to throw?
            throw new TypeError(fnRef + ' is not a function. ' + fnRef + ' toString value is:' +
                            untrackedOriginal + ' and is of type:' + typeof untrackedOriginal);
          } else {
            fireUncaughtExcepton(e);
          }
        }
      };

      // If the users additionalFunctionality function will call originalFunction asynchronously,
      // they can tell us NOT to call it
      function dontCallOriginal() {
        wasOrignalCalled = true; // Original WILL be called, so we're just going to say it was already
      }

      var originalReturn;
      var newReturn = addedFunctionality.call(this, args, originalFunction, dontCallOriginal);
      if (!wasOriginalCalled) {
        wasOriginalCalled = false; // reset in case a function dynamically calls the originalFunction (??)
        originalReturn = originalFunction.apply(this, args);
      }

      return (newReturn === undefined ?
               originalReturn
              :
               newReturn
             );
    }

    // Preserve function.length since extendedFunction doesn't list arguments!
    extendedFunction.length = originalFunction.length;

    // Maintain prototype property
    extendedFunction.prototype = originalFunction.prototype;

    // Maintain constructor property
    extendedFunction.constructor = originalFunction.constructor;

    // Ensure all properties are copied over..
    for (var prop in originalFunction) {
      if (Object.prototype.hasOwnProperty.call(originalFunction, prop)) {
        extendedFunction[prop] = originalFunction[prop];
      }
    }

    if (propertyArray && propertyArray.length === 0) {
      eval('(typeof window !== "undefined" ? window : global).' + fnRef + ' = ' + extendedFunction.toString());
    } else {
      return extendedFunction;
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = extendFunction;
  }
  window.extendFunction = extendFunction;
})( this );