"use strict";

/**
 * A parameter for a command.
 */
class Parameter {
    constructor(parameterName,command){
        this.name = parameterName;
        this.command = command;
    }

    /**
     * The command will pass to the parameter the value so
     * that it can be treated.
     * The parameter will update the model of the command,
     * or set it as incorrect and explain the reason if any
     * parsing or validating error was generated.
     * To be implemented by subclasses.
     */
    parse(){throw new Error("the parse method must be implemented by Command subclasses");}

}

module.exports = Parameter;