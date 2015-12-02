"use strict";

var Parameter = require('../Parameter');
var ParseError = require('../exceptions').ParseError;

/**
 * The parameter 'from' of the TestCommand.
 * Only admits ISO8601 format.
 * @type {FromParameter}
 */
class FromParameter extends Parameter {
    constructor(command){
        super('from',command);
    }

    /**
     * Expects an ISO8601 date format.
     * @param date cannot be empty
     */
    parse(date){
        if(typeof date === 'undefined' || date === '') {
            throw new ParseError('the "from" parameter cannot be empty');
        }

        this.command.model.from = new Date(date);
    }
}

module.exports = FromParameter;