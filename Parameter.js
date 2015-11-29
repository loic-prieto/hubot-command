/**
 * A parameter for a command.
 */
module.exports = Parameter;

function Parameter(parameterName,command){
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
Parameter.prototype.parse = unimplementedFunction;

Parameter.prototype.getCommand = function(){return this.command;};
Parameter.prototype.getName = function(){return this.name;};

/**
 * Utility function to warn the dev to implement functions.
 */
function unimplementedFunction(){
    console.log("an unimplemented function was called on the command "+this.name);
    throw "Unimplemented function";
}
