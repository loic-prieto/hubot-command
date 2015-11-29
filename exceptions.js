//Exceptions
/**
 * A parse error is thrown when a function discovers that
 * the text passed to it is wrongly written for parsing.
 * Inherits from Error object.
 * @param {string} cause - A descriptive cause
 * @constructor
 */
exports.ParseError = ParseError;

/**
 * A validation error is thrown when a method tries
 * to validate something but fails.
 * Inherits from Error.
 * @param {string} cause - A descriptive cause
 * @constructor
 */
exports.ValidationError = ValidationError;


//Implementation
function ParseError(cause){
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = cause;
  this.name = 'ParseError';
}
ParseError.prototype = Object.create(Error.prototype);

function ValidationError(cause){
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = cause;
  this.name = 'ValidationError';
}
ValidationError.prototype = Object.create(Error.prototype);
