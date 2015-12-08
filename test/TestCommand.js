"use strict";

var Command = require('../Command.js');
var FromParameter = require('./FromParameter');
var ToParameter = require('./ToParameter');

/**
 * A test command to be used in the test suite of
 * the Allen Commands library.
 * @constructor
 * @type {TestCommand}
 */
class TestCommand extends Command {
    constructor() {
        super('test');
        this.addParameter(new FromParameter(this));
        this.addParameter(new ToParameter(this));
        this.help = "A test command to prove that the library works";
    }

    run(){
        this.model.executed = true;
        return this.model;
    }

    validate(){
        //Validates that the from date is before the to date
        return this.model.from.getTime() < this.model.to.getTime();
    }

}

module.exports = TestCommand;