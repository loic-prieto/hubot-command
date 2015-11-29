/**
 * The parameter 'from' of the TestCommand.
 * Only admits ISO8601 format.
 * @type {FromParameter}
 */
module.exports = FromParameter;

//Implementation
var Parameter = require('../Parameter');
var ParseError = require('../exceptions').ParseError;

function FromParameter(command){
  Parameter.call(this,'from',command);
}
FromParameter.prototype = Object.create(Parameter.prototype);

/**
 * Expects an ISO8601 date format.
 * @param dateVal cannot be empty
 */
FromParameter.prototype.parse = function(dateVal){
  if(typeof dateVal === 'undefined' || dateVal === '') {
    throw new ParseError('the "from" parameter cannot be empty');
  }

  this.command.getModel().from = new Date(dateVal);
}
