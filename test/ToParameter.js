var Parameter = require('../Parameter');
var ParseError = require('../exceptions').ParseError;

/**
 * The parameter 'to' of the TestCommand.
 * @type {ToParameter}
 */
module.exports = ToParameter;

function ToParameter(command){
  Parameter.call(this,'to',command);
}
ToParameter.prototype = Object.create(Parameter.prototype);

/**
 * Expects an ISO8601 date format.
 * @param parameterValueText cannot be empty
 */
ToParameter.prototype.parse = function(parameterValueText){
  if(typeof parameterValueText === 'undefined' || parameterValueText === '') {
    throw new ParseError('the "to" parameter cannot be empty');
  }

  this.command.getModel().to = new Date(parameterValueText);
}
