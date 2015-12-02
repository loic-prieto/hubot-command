"use strict";

/**
 * A parse error is thrown when a function discovers that
 * the text passed to it is wrongly written for parsing.
 * Inherits from Error object.
 * @param {string} cause - A descriptive cause
 * @constructor
 */
class ParseError extends Error {
    constructor(cause){
        super();
        this.message = cause;
        this.name = 'ParseError';
    }
}

/**
 * A validation error is thrown when a method tries
 * to validate something but fails.
 * Inherits from Error.
 * @param {string} cause - A descriptive cause
 * @constructor
 */
class ValidationError extends Error {
    constructor(cause){
        super();
        this.message = cause;
        this.name = 'ValidationError';
    }
}


exports.ParseError = ParseError;
exports.ValidationError = ValidationError;