/**
 * Represents a command to be parsed by hubot.
 * The command has a name and has parameters.
 * This is the abstract class. A subclass must implement
 * the command methods, including defining it's parameters
 * and the optional validation method.
 *
 * Once subclassed, the intended use of a Command is by using
 * it's execute method, which takes a command string as written
 * by a client and performs validation and execution of the
 * actions it's programmed to do.
 * example:
 *     testCommand.execute('test from 2015 to 2016');
 * The execute function must return a promise with the result of
 * the command.
 *     testCommand.execute('test from 2015 to 2016')
 *         .then(function(result){ //result may be any type of object
 *             chat.send('Your command was executed: '+result);
 *         })
 *         .catch(ParseError,ValidationError,function(error){
 *             chat.send('Your command could not be executed: '+error.message);
 *         });
 *
 * If you just want to see if the command is valid without performing the actual
 * action, you can use the parse method.
 * example:
 *     testCommand.parse('test from 2015 to 2016')
 *         .then(function(model){
 *             // parse gives the modified model as a result for testing purposes
 *             chat.send('The given input was a valid command');
 *         })
 *         .catch(ParseError,ValidationError,function(error){
 *             chat.send('The given input could not be parsed: '+error.message);
 *         });
 *
 * This base class takes care of the parameter value delivery, so that the user can
 * "just" create the parameters, which will implement their parse operation upon
 * values received by the command, and use those created parameters in the Command
 * subclass constructor, like so:
 *     function TestCommand(){
 *         Command.call(this,'test');
 *         this.addParameter(new FromParameter());
 *         this.addParameter(new ToParameter());
 *     }
 *     TestCommand.prototype = Object.create(Command.prototype);
 * Where FromParameter is defined like so:
 *     function FromParameter(command){
 *         Parameter.call(this,'from',command);
 *     }
 *     FromParameter.prototype = Object.create(Parameter.prototype);
 *
 *     FromParameter.prototype.parse = function(parameterValueText){
 *         if(typeof parameterValueText === "undefined" || parameterValueText !== '') {
 *             throw new ParseError('the "from" parameter cannot be empty');
 *         }
 *         this.getModel().from = new Date(parameterValueText);
 *     }
 *
 * See the test folder for a thorough example.
 *
 */

var Command = require('./Command');
var Parameter = require('./Parameter');
var exceptions = require('./exceptions');

exports.Command = Command;
exports.Parameter = Parameter;
exports.ParseError = exceptions.ParseError;
exports.ValidationError = exceptions.ValidationError;
