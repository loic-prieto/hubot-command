"use strict";

var Parameter = require('../Parameter');
var ParseError = require('../exceptions').ParseError;

/**
 * The parameter 'to' of the TestCommand.
 * @type {ToParameter}
 */
class ToParameter extends Parameter {
    constructor(command){
        super('to',command);
        this.help.header = "when to stop";
        this.help.detail = "When to stop the command. ISO8601 date format expected.";
    }

    /**
     * Expects an ISO8601 date format.
     * @param date cannot be empty
     */
    parse(date){
        if(typeof date === 'undefined' || date === '') {
            throw new ParseError('the "to" parameter cannot be empty');
        }

        this.command.model.to = new Date(date);
    }
}

module.exports = ToParameter;