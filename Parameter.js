"use strict";

/**
 * A parameter for a command.
 *
 * The name of the command must be one word only. If more than one word
 * is needed, just add hyphens, or whichever symbol your prefer.
 * No convention is enforced, you could go for the traditional unix command, as in
 * --multi-word-parameter, or -parameter, or even just the word without any other symbol.
 * Just make sure to be keep consistency with the other commands of your system to avoid
 * confusion for the user.
 *
 * For parameters that are more complex in it's syntax (such as natural language like parameters),
 * the parameter can receive the whole command input string. In that case, the name has of
 * the parameter is only used conceptually.
 * The attribute "wholeCommandString" is a boolean that allows the Command subclass to check
 * whether it has to pass the whole command input string to the parameter or try to narrow
 * what it has to give it by the parameter name inside the command input string.
 * The wholeCommandString attribute can be specified on the constructor. It defaults to false.
 *
 * A command just parses the value provided by the command to it, it is not supposed to
 * perform any action by itself. Just parse the command and put any relevant information
 * in the command's model,which may be accessed with this.command.model .
 *
 * The attributes help.header and help.detail are strings that will be used by the help
 * action of the command, which is invoked by writing "<commandName> help <parameterName>"
 * or "<commandName> help".
 * The help.header attribute is used when listing the general command info, a brief description
 * of the parameter. The help.detail is used when providing help for a specific parameter.
 *
 */
class Parameter {
    constructor(parameterName,command,wholeCommandString=false){
        this.name = parameterName;
        this.command = command;
        this.help = {
            header: this.name,
            detail: ""
        };
		this.wholeCommandString = wholeCommandString;
    }

    /**
     * The command will pass to the parameter the value so that it can be treated.
     * The parameter will update the model of the command, or throw either ParseError
     * or ValidationError when the parsing cannot pass successfully.
     *
     * To be implemented by subclasses.
     */
    parse(){throw new Error("the parse method must be implemented by Command subclasses");}

}

module.exports = Parameter;
