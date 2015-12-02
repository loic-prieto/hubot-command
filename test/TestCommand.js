"use strict";

var Command = require('../Command.js');
var FromParameter = require('./FromParameter');
var ToParameter = require('./ToParameter');

/**
 * A test command to be used in the test suite of
 * the Allen Commands library.
 * @constructor
 */
class TestCommand extends Command {
    constructor() {
        super('test');
        this.addParameter(new FromParameter(this));
        this.addParameter(new ToParameter(this));
    }

    execute(commandString) {
        //For the sake of the test, I'm not verifying if the command was already parsed before
        this.model = {};
        return this.parse(commandString)
            .bind(this)
            .then(function () {
                this.model.executed = true;
                return this.model;
            });
    }

    validate(){
        //Validates that the from date is before the to date
        return this.model.from.getTime() < this.model.to.getTime();
    }

}

module.exports = TestCommand;