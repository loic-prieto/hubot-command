"use strict";

let Command = require('../Command.js');
let FromParameter = require('./FromParameter');
let ToParameter = require('./ToParameter');
let ComplexParameter = require('./ComplexParameter.js');

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
		this.addParameter(new ComplexParameter(this));
        this.help = "A test command to prove that the library works";
    }

    run(){
        this.model.executed = true;
        return this.model;
    }

    validate(){
        //Validates that the from date is before the to date
		let areDatesCorrect = this.model.from.getTime() < this.model.to.getTime();

		//Validates that the complex parameter has done it's work
		let isWholeParameterCorrect = this.model.complexDump === 'from 2015-12-01T09:00 to 2015-12-01T10:30'; //This comes from the test.js file

		return areDatesCorrect && isWholeParameterCorrect;
    }

}

module.exports = TestCommand;
