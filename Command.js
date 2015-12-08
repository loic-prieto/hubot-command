"use strict";

var ValidationError = require('./exceptions.js').ValidationError;
var ParseError = require('./exceptions.js').ParseError;
var Promise = require('bluebird');

/**
 * Represents a command to be parsed by hubot.
 * The command has a name and has parameters.
 * This is the abstract class. A subclass must implement the command methods,
 * including defining it's parameters and the optional validation method.
 *
 * Once subclassed, the intended use of a Command is by using it's execute method,
 * which takes a command string as written by a client and performs validation
 * and execution of the actions it's programmed to do.
 * example:
 *     testCommand.execute('test from 2015 to 2016');
 * The execute function must return a promise with the result of the command.
 *     testCommand.execute('test from 2015 to 2016')
 *         .then(function(result){ //result may be any type of object
 *             chat.send('Your command was executed: '+result);
 *         })
 *         .catch(ParseError,ValidationError,function(error){
 *             chat.send('Your command could not be executed: '+error.message);
 *         });
 *
 * This base class takes care of the parameter value delivery, so that the user can
 * "just" create the parameters, which will implement their parse operation upon
 * values received by the command, and use those created parameters in the Command
 * subclass constructor, like so:
 *     class TestCommand extends Command {
 *         constructor(){
 *             super('test');
 *             this.addParameter(new FromParameter(this));
 *             this.addParameter(new ToParameter(this));
 *             this.help = "A test command to prove the system works";
 *         }
 *         run(){
 *             return new Promise(function(resolve){ //No need tp return a promise, it can be anything.
 *                 return "completed successfully with from parameter equal to: "+this.from;
 *             }).bind(this.model);
 *         }
 *     }
 * Where FromParameter is defined like so:
 *     class FromParameter extends Parameter {
 *         constructor(command){
 *             super('from',command);
 *             this.help.header = 'to define when to start';
 *             this.help.detail = '
 *         }
 *         parse(parameterValue){
 *             if(typeof parameterValue === "undefined" || parameterValue !== '') {
 *              throw new ParseError('the "from" parameter cannot be empty');
 *             }
 *             this.model.from = new Date(parameterValue);
 *         }
 *     }
 *
 * A command also has help by default, both for the command itself, and for it's parameters.
 * When the user types "<commandName> help", then the help action of the command is executed,
 * which uses the help attribute of the command and of it's parameters help.header to display
 * general information. The helpHeader attribute may be overridden by the parameter's subclass.
 * If the user types instead "<commandName> help <parameterName>", the help action returns the
 * text provided by the parameter's help.detail attribute, which may also be overridden by
 * subclasses to provide a detailed help.
 *
 */
class Command {
    constructor(commandName){
        this.name = commandName;
        this.parameters = {};
        this.model = {};
        this.help = commandName; //Stupid help default
    }

    /**
     * Parses the given input string. Performs the parsing without executing the
     * command itself. By the time the parsing is complete, the model of the command
     * instance has been created/modified so that the execute method can act upon it.
     * A semantic validation of the parameters is done upon ending the parse method.
     * Each subclass may override the default validate method (which returns always true).
     *
     * @param {string} commandString - the command string to parse.
     * @private
     * @returns {promise} - A promise with no result.
     * @throws {ParseError} - When one of the parameters are not valid, or the command itself
     *                        cannot be parsed by this object.
     * @throws {ValidationError} - When the command doesn't pass the semantic validation.
     */
    _parse(commandString){
        var self = this;
        return new Promise(function(resolve){
            //Quick command validation
            if(!self.willParseCommand(commandString)){
                throw new ParseError('The given input ('+commandString+') cannot be parsed by the command '+self.name);
            }

            //We substract the name of the command, since were only interested
            //in the parameters now.
            commandString = commandString.substring(self.name.length+1);

            // Decompose it by parameters.
            // We know that each parameter will be separated by another
            // by the parameter names themselves.
            // Parameters names are one word only to simplify distinction
            var words = commandString.split(" ");
            var parameterValueBuffer = "";
            var previousParameter = null;
            for (var i = 0; i < words.length; i++) {
                var currentWord = words[i];
                var potentialParameter = self.getParameter(currentWord);
                if (potentialParameter != null) {
                    // If we've found a new parameter, then we invoke the previous parameter
                    // with the current parameterValueBuffer and start recollecting the value
                    // for the next one.
                    if (previousParameter != null) {
                        previousParameter.parse(parameterValueBuffer.trim());
                    }
                    previousParameter = potentialParameter;
                    parameterValueBuffer = "";
                } else {
                    //If this word isn't a new parameter, then we add the current word to
                    //the value buffer that will be passed to the current parameter
                    parameterValueBuffer += currentWord+" ";
                }
            }
            // Upon reaching the end of the parameter parsing, we can be in one of the following states:
            // - The parameterValueBuffer is not empty, which means that this was the current parameter is
            // the last, and must now be parsed.
            // - The parameterValueBuffer is empty and the previousParameter has a value, which means that
            // the last parameter has no value and must be parsed.
            if ((parameterValueBuffer !== "") || (previousParameter !== null)) {
                previousParameter.parse(parameterValueBuffer.trim());
            }

            // Unless there has been an exception thrown while parsing the parameters, the model of the command
            // has been modified, and the command is ready to be executed. If the subclass defines a validate
            // method, it is invoked here, and if it returns false, an exception is thrown.
            if (!self.validate()) {
                //To throw a fully fledged exception with individual reasons.
                throw new ValidationError("The arguments passed to the parameter are not valid");
            }

            resolve(self.model);
        });
    }

    /** * Adds a parameter to this command that will be part of
     * the parsing process.
     * @param {Parameter} parameter
     */
    addParameter(parameter){
        this.parameters[parameter.name] = parameter;
    }

    /**
     * Retrieves a parameter of the command by name.
     * @retuns {Parameter} null if it isn't found
     * @param {string} parameterName - The name of the parameter to retrieve
     */
    getParameter(parameterName){
        var parameter = this.parameters[parameterName];
        if (typeof parameter === "undefined") {
            parameter = null;
        }

        return parameter;
    }

    /**
     * Performs the functionality that the command is associated with,
     * based on the parameters it received on the parse function.
     * This function can obtain the model produced by the parse function
     * by calling this.getModel().
     * The base class does not provide a default execute behaviour, which
     * means that the user has to call parse either inside the implemented execute
     * method or force it's user to call parse before executing.
     *
     * To be implemented by subclasses.
     *
     * @param {string} inputCommand - Optional. If given, implies a a parse
     *        of the given commandString. If not, the method must either check
     *        for itself if the model has been modified by a previous parse
     *        or launch parse itself if needed.
     * @returns {Promise} A promise with the result of the execution.
     * @throws {ParseError} When one of the parameters are not valid, or the command itself
     *                      cannot be parsed by this object.
     * @throws {ValidationError} When the command doesn't pass the semantic validation.
     */
    execute(inputCommand){
        var result = null;
        if(isHelpCommand(inputCommand)){
            result = this._help(inputCommand);
        } else {
            //first parse the command
            result = this._parse(inputCommand)
                .bind(this)
                .then(function(){
                    return this.run();
                })
        }

        return result;
    }

    /**
     * Performs the help action. Looks if it has to provide help
     * about one of the parameters or if it has to provide help
     * about the command itself.
     * For the command, the help action returns whatever the subcommand's help
     * method provides plus a list of the parameters and their quick explanation.
     * @param {string} - inputCommand
     * @private
     * @returns {promise} - a promise with a string result of the help to display.
     */
    _help(inputCommand){
        var parameterName = inputCommand.replace(this.name,"")
                .replace("help","")
                .trim();
        var parameterMode = parameterName !== "";
        var self = this;
        return new Promise(function(resolve){
            let result = "";
            if(parameterMode){
                let parameter = self.getParameter(parameterName);
                if(parameter === null) {
                    throw new ParseError("The given parameter ("+parameterName+") does not exist for this command.");
                } else {
                    result += parameter.name + ":\n\t" + parameter.help.detail;
                }
            } else {
                //Just get the commands general help and then add each parameter name
                result = self.help;
                result += "\n\nParameters:\n"
                for(let key in self.parameters){
                    let parameter = self.parameters[key];
                    result += "\t- "+parameter.name+": "+parameter.help.header+"\n";
                }
            }

            resolve(result);
        });
    }

    /**
     * This is the method that must be implemented by Command subclasses. By the time
     * it is invoked, the command will have been parsed and the model ready to use
     * under the 'model' attribute of the instance.
     * If the command was invoked with a help action, it won't get executed, and instead
     * will just fetch the information from the command and it's parameters help.
     *
     * May return any type of object, including a promise (if it is a promise, it must be
     * of the bluebird library for composability).
     * @returns {object} - a promise of the result if any.
     */
    run(){
        throw new Error("The run method must be implemented by the Command subclass");
    }

    /**
     * Validates the model of the command.
     * The model may have been modified by the parsing of
     * the parameters, so it is called after parsing the command.
     * May be implemented by the subclasses.
     * By default returns true.
     * @returns {boolean} - true if the model of the command is valid.
     */
    validate(){return true;}

    /**
     * When we want to make sure in a fast and inexpensive way
     * of whether this command will parse the arbitrary given
     * input, we should use this function.
     * Filters out whether the given input is a potential command
     * to be parsed by this object.
     * To determine so, it just compares the beginning of the
     * input to check if it matches to the command name.
     * The use case of this method is when you have multiple commands
     * and a dynamic dispatcher that must select to which object
     * to send it, or to provide a quick discard way of observers.
     *
     * @param {string} commandString - the command string to analyze
     *
     * @returns {boolean} - true if it is a valid command for this object.
     */
    willParseCommand(commandString){
        return commandString.substring(0,this.name.length) === this.name;
    }

}

module.exports = Command;

/**
 * Checks whether the command is of type help.
 * A help command has the form <commandName> help [<parameterName>].
 *
 * @param inputCommand
 * @returns {boolean} - true if it is
 */
function isHelpCommand(inputCommand){
    return inputCommand.match(/help/);
}