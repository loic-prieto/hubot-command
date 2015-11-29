/**
 * A test command to be used in the test suite of
 * the Allen Commands library.
 * @constructor
 */
module.exports = TestCommand;

//Implementation
var Command = require('../Command.js');
var FromParameter = require('./FromParameter');
var ToParameter = require('./ToParameter');

function TestCommand() {
  Command.call(this, 'test');
  this.addParameter(new FromParameter(this));
  this.addParameter(new ToParameter(this));
}
TestCommand.prototype = Object.create(Command.prototype);

TestCommand.prototype.execute = function (commandString) {
  //For the sake of the test, I'm not verifying if the command was already parsed before
  this.clearModel();
  return this.parse(commandString)
    .bind(this)
    .then(function() {
      this.model.executed=true;
      return this.model;
    });
};

TestCommand.prototype.clearModel = function(){this.model={};};

TestCommand.prototype.validate = function(){
  //Validates that the from date is before the to date
  return this.model.from.getTime() < this.model.to.getTime();
};
