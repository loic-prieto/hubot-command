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
function TestCommand() {
  Command.call(this, 'test');
  this.addParameter(new FromParameter(this));
  this.addParameter(new ToParameter(this));
}
TestCommand.prototype = Object.create(Command.prototype);

TestCommand.prototype.execute = function (commandString) {
  //For the sake of the test, I'm not verifying if the command was already parsed before
  this.clearModel();
  return this.parse(commandString)
    .bind(this)
    .then(function() {
      this.model.executed=true;
      return this.model;
    });
};
TestCommand.prototype.validate = function(){
  //Validates that the from date is before the to date
  return this.model.from.getTime() < this.model.to.getTime();
};
````

_FromParameter.js_
````javascript
function FromParameter(command){
  Parameter.call(this,'from',command);
}
FromParameter.prototype = Object.create(Parameter.prototype);

FromParameter.prototype.parse = function(dateVal){
  if(typeof dateVal === 'undefined' || dateVal === '') {
    throw new ParseError('the "from" parameter cannot be empty');
  }

  this.command.getModel().from = new Date(dateVal);
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
The library is implemented as pure javascript, instead of CofeeScript, including OOP with prototypes. It's quite ugly, 
so I guess i will implement the OOP with an easier to the eye OOP library.

I'm using bluebird for promise handling.

Tests are executed with mocha and asserts are using chai assert style, with a sprinkle of chai-as-promised.
