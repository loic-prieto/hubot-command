"use strict";

var Redis = require('ioredis');

/**
 * Handles all the Command registry operations.
 * Maintains a registry of commands to allow them to
 * be discoverable.
 *
 * This class provides only static methods since no state 
 * is maintained whatsoever on the class itself.
 *
 * Uses redis to maintain data. By it's very nature, the data
 * is not persisted, which means that for each time the application
 * is launched, it should ensure the data is there.
 *
 */
class CommandRegistry {
	
	/**
	 * Adds a command to the registry.
	 * If the command already exists, then it is not updated.
	 * @param command {Command} the command itself
	 * @return {Promise} for when the operation is done.
	 */
	static addCommand(command){
		let redis = new Redis();
		let keyName = composeCommandKey(command);
		return 
			redis.hgetall(keyName)
				.then(function(result){
					if(result === null){ // The key is not yet created.
						let hash = {
							name: command.name,
							description: command.help
						};
						return redis.hset(keyName,hash);
					}	
				})
				.then(function(result){
					//We do not want to expose the redis result
					return;	
				});	
	}

	/*
	 * Returns a list of all the commands held in the registry.
	 * @return {Promise} with an array of maps with the following structure
	 *     { name:"commandName",description:"description" }
	 */
	static getListOfCommands(){
		let redis = new Redis();
		return 
			redis.keys(COMMANDS_MAP_KEY_BASE)
				.then(function(keys){
					let pipeline = redis.pipeline();
					for(let key of keys){
						pipeline.hgetall(key);
					}
					
					return pipeline.exec();
				})
				.then(function(results){
					let commands = new Array();
					for(let result of results){
						let command = result[1];
						commands.push(command);
					}
					return commands;
				});
	}

	/*
	 * Returns a command as held in the registry if it exists.
	 * @return {Promise} with the result in the following structure:
	 *     {name:"commandName",description:"description"} or null if
	 *     the command doesn't exist.
	 */
	static getCommand(commandName){
		let redis = new Redis();
		return redis.hgetall(composeCommandKey({name:commandName}));
	}
}

/*
 * Builds the key name for a given command.
 * Since redis does not allow for nested structures, the namespacing
 * of commands will be done with the key.
 * For example:
 *  "hubots-commands.registry.commandName"
 *  which will hold	the following hash:
 *  {
 *    name:"commandName",
 *    description:"description"
 *  }
 */
function composeCommandKey(command){
	return `${COMMANDS_MAP_KEY_BASE}.${command.name}`;
}

const COMMANDS_MAP_KEY_BASE = "hubot-commands.registry";
