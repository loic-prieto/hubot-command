# hubot-command
A library to let hubot parse commands and execute them in an easy manner.

## Usage

In the hubot main folder's package.json:
```json
{
  [...]
  "dependencies":{
    "hubot-command":"x.y.z"
  }
  [...]
}
````
There are two main classes: Command and Parameter.

A command has a name and has zero to many parameters. For each command you want hubot to be able  to execute you will
have to subclass a Command, and the many Parameters it has. Full usage details can be seen in the provided tests, but 
have a sample:

_TestCommand.js_
````javascript
class TestCommand extends Command {
    constructor() {
        super('test');
        this.addParameter(new FromParameter(this));
        this.addParameter(new ToParameter(this));
        this.help = "A test command to prove that the library works";
    }

    //Will be invoked by the execute command that the client uses, it's "private" to the class.
    run(){
        this.model.executed = true;
        return this.model; //I could also return a [bluebird] promise, not only objects.
    }

    validate(){
        //Validates that the from date is before the to date
        return this.model.from.getTime() < this.model.to.getTime();
    }

}
````

_FromParameter.js_
````javascript
class FromParameter extends Parameter {
    constructor(command){
        super('from',command);
        this.help.header = "when to start";
        this.help.detail = "From when to start the command. ISO8601 date format expected.";
    }

    parse(date){
        if(typeof date === 'undefined' || date === '') {
            throw new ParseError('the "from" parameter cannot be empty');
        }

        this.command.model.from = new Date(date);
    }
}
````

Once you have the commands, you can use them in your hubot code, like so:
````javascript
module.exports = function(robot){
    robot.hear(/^bot (.*)$/,function(chat){
        var command = chat.match[1];
        //Here comes a dynamic dispatcher, but I'm simplifying for the example
        var testCommand = new TestCommand();
        if(testCommand.willParseCommand(command)){
          testCommand.execute(command)
            .then(function(result){
              chat.send("I've processed the command given, master. May I have a candy? :smile:");
            });
        } else {
          chat.send('I do not understand your command, master :confused:');
        }
    });
};
````

## Implementation
The library is implemented as pure javascript, instead of CoffeeScript. Ecmascript 6 classes and arrow functions are used for OOP syntactic sugar, so
a compatible nodejs runtime is needed (6.x+)

Bluebird is used for promise handling.

Tests are executed with mocha and asserts are using chai assert style, with a sprinkle of chai-as-promised. All integrated with npm, of course.
