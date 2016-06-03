var Sequelize  = require('Sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
	"dialect": "sqlite",
	"storage": __dirname + "/basic-sqlite-database.sqlite"
});

var Todo = sequelize.define('todo', {
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate:{
			len: [1,250]
		}
	},
	complete: {
		type: Sequelize.BOOLEAN,
		allowNull:false,
		defaultValue: false
	}
});

sequelize.sync({
	force:true	
}).then(function(){

	console.log("Everything is synced");
	Todo.create({
		description: "Walk the dog"
		/*complete: false*/
	}).then(function(todo){
		/*console.log("Finished");
		console.log(todo);*/
		Todo.create({
			description: "Catch the opportunity"
		});
	}).then(function(){
		//return Todo.findById(1);
		return Todo.findAll(
			{
				where:{
					description:
					{
						$like: '%catch%'
					}
				}
			});
	}).then(function(todos){
		if(todos)
		{
			todos.forEach(function(todo){
				console.log(todo.toJSON());
			});
		}
		else
		{
			console.log('No todo found');
		}
	}).catch(function(e){
		console.log(e);
	});

});