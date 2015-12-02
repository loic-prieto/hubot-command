"use strict";

var ValidationError = require('./exceptions.js').ValidationError;
var ParseError = require('./exceptions.js').ParseError;
var Promise = require('bluebird');

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
 */
class Command {
    constructor(commandName){
        this.name = commandName;
        this.parameters = {};
        this.model = {};
    }

    /**
     * Parses the given input string. Performs the parsing without executing the
     * command itself. By the time the parsing is complete, the model of the command
     * instance has been created/modified so that the execute method can act upon it.
     * A semantic validation of the parameters is done upon ending the parse method.
     * Each subclass may override the default validate method (which returns always true).
     *
     * @param {string} commandString - the command string to parse.
     * @returns {promise} - A promise with no result.
     * @throws {ParseError} - When one of the parameters are not valid, or the command itself
     *                        cannot be parsed by this object.
     * @throws {ValidationError} - When the command doesn't pass the semantic validation.
     */
    parse(commandString){
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
                        previousParameter.parse(parameterValueBuffer);
                    }
                    previousParameter = potentialParameter;
                    parameterValueBuffer = "";
                } else {
                    //If this word isn't a new parameter, then we add the current word to
                    //the value buffer that will be passed to the current parameter
                    parameterValueBuffer += currentWord;
                }
            }
            // Upon reaching the end of the parameter parsing, we can be in one of the following states:
            // - The parameterValueBuffer is not empty, which means that this was the current parameter is
            // the last, and must now be parsed.
            // - The parameterValueBuffer is empty and the previousParameter has a value, which means that
            // the last parameter has no value and must be parsed.
            if ((parameterValueBuffer !== "") || (previousParameter !== null)) {
                previousParameter.parse(parameterValueBuffer);
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
     * @param {string} commandString - Optional. If given, implies a a parse
     *        of the given commandString. If not, the method must either check
     *        for itself if the model has been modified by a previous parse
     *        or launch parse itself if needed.
     * @returns {Promise} A promise with the result of the execution.
     * @throws {ParseError} When one of the parameters are not valid, or the command itself
     *                      cannot be parsed by this object.
     * @throws {ValidationError} When the command doesn't pass the semantic validation.
     */
    execute(commandString){
        throw new Error("the execute method must be implemented by Command subclasses");
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