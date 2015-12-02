var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
var assert = chai.assert;
var TestCommand = require('./test/TestCommand.js');
var ParseError = require('./exceptions.js').ParseError;
var ValidationError = require('./exceptions.js').ValidationError;

describe('Allen command library', function () {

    describe('Command object', function () {

        var TEST_COMMAND_INPUT_STRING = 'test from 2015-12-01T09:00 to 2015-12-01T10:30';

        it('should create a subclassed command correctly', function () {
            var testCommand = new TestCommand();

            //Basic assertions
            assert.isDefined(testCommand, 'the test command is undefined');
            assert.isNotNull(testCommand, 'the test command is null');
            assert.equal(testCommand.name, 'test', 'the test command name should be test');

            //Parameters test
            assert.isObject(testCommand.getParameter('from'), 'The test command should have a from parameter');
            assert.isObject(testCommand.getParameter('to'), 'The test command should have a to parameter');
        });

        it('should parse correctly a valid test command', function () {
            var testCommand = new TestCommand();
            return assert.isFulfilled(testCommand.parse(TEST_COMMAND_INPUT_STRING), "the test parsing should be completed successfully");
        });

        it('should give correct model values for the test command when parsed successfully', function () {
            var testCommand = new TestCommand();
            return assert.eventually.property(testCommand.parse(TEST_COMMAND_INPUT_STRING), 'from', 'from property should be set to 2015-12-01T09:00');
        });

        it('should throw a ValidationError when the from parameter has a date value later than the to parameter date value', function () {
            var testCommand = new TestCommand();
            return assert.isRejected(testCommand.parse('test from 2015-12-01T10:30 to 2015-12-01T09:00'), ValidationError, "The invalid test command should be rejected because of invalid dates");
        });

        it('should execute correctly the command', function () {
            var testCommand = new TestCommand();
            return assert.eventually.property(testCommand.execute(TEST_COMMAND_INPUT_STRING), 'executed', 'The executed property of the model should have been set after execution');
        });

        it('should throw ParseError when fed an invalid command', function () {
            var testCommand = new TestCommand();
            return assert.isRejected(testCommand.parse('invalidCommand'), ParseError, "the invalid command parsing should be rejected");
        });
    });

});
