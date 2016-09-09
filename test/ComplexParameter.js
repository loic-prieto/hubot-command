"use strict";

var Parameter = require('../Parameter');

/**
 * The parameter 'complex' of the TestCommand.
 * The name isn't used at all in the input command string.
 * @type {FromParameter}
 */
class ComplexParameter extends Parameter {
    constructor(command){
        super('complex',command,true);
        this.help.header = "An arbitrary complex parameter that needs the whole command input string.";
        this.help.detail = "detail";
    }

    /**
     * Just puts what is given by parameter in the model. 
     * @param date cannot be empty
     */
    parse(wholeCommand){
        this.command.model.complexDump = wholeCommand;
    }
}

module.exports = ComplexParameter;
