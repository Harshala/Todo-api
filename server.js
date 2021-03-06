var express = require('express');
var app = express();
var _ = require('underscore');
var db = require("./db.js");
var todoIdNext = 1;
var bodyParser = require('body-parser');
var bcrypt = require("bcrypt");

var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

/*{
	id: 1,
	description: "Meet ben in market",
	completed: false
}, {
	id: 2,
	description: "Go to Market",
	completed: false
},
{
	id: 3,
	description: "Watch the dog",
	completed: true
}*/

var todos = [];

app.get('/', function(req, res) {
	res.send('Todo Api running');
});

/*app.get('/todos', function(req, res){
	res.json(todos);
});*/

app.get('/todos', function(req, res) {
	//var queryparams = req.query;
	var query = req.query;
	var where = {};

	if(query.hasOwnProperty("complete") && query.complete === "true")
	{
		where.complete = true;
	}
	else if(query.hasOwnProperty("complete") && query.complete === "false")
	{
		where.complete = false;
	}

	if(query.hasOwnProperty("q"))
	{
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({where:where}).then(function(todos){
		res.json(todos);
	}, function(e){
		res.status(500).send();
	});

	/*var filteredTodos = todos;

	if (queryparams.hasOwnProperty("complete") && queryparams.complete === 'true') {
		filteredTodos = _.where(filteredTodos, {
			"complete": true
		});
	} else if (queryparams.hasOwnProperty("complete") && queryparams.complete === 'false') {
		filteredTodos = _.where(filteredTodos, {
			"complete": false
		});
	}

	if (queryparams.hasOwnProperty("q")) {
		filteredTodos = _.filter(filteredTodos, function(todo) {
			return todo.description.toLowerCase().indexOf(queryparams.q.toLowerCase()) > -1
		});
	}

	res.json(filteredTodos);*/
});

app.get('/todos/:id', function(req, res) {
	var TodoId = parseInt(req.params.id);
	/*var matchedTodo;

	todos.forEach(function(todo){
		if(todo.id === TodoId)
		{
			matchedTodo = todo;
		}
	});*/

	/*var matchedTodo = _.findWhere(todos, {
		id: TodoId
	});

	if (matchedTodo) {
		res.json(matchedTodo);
	} else {
		res.status(404).send();
	}*/

	db.todo.findById(TodoId).then(function(todo){
		if(todo)
		{
			res.send(todo.toJSON());
		}
		else
		{
			res.status(404).send();
		}
	},function(e){
		res.status(500).send();
	});

});

app.post('/todos', function(req, res) {
	//var body = req.body;

	var body = _.pick(req.body, "description", "complete");

	/*if (!_.isBoolean(body.complete) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}

	body.description = body.description.trim();

	body.id = todoIdNext++;
	todos.push(body);
	res.json(body).send();*/

	db.todo.create(body).then(function(todo){		
		res.json(todo.toJSON());
	},function(e){
		res.status(400).json(e);
	});
});

app.delete('/todos/:id', function(req, res) {
	var TodoId = parseInt(req.params.id, 10);

	db.todo.destroy({
		where:
		{
			id: TodoId
		}
	}).then(function(rowsDeleted){		
		if(rowsDeleted===0)
		{
			res.status(404).json({error: 'No record with id'});
		}
		else
		{
			res.status(204).send();
		}
	}, function(e){
		res.json("Record with Id: "+ TodoId+" not found");
	});

	/*var matchedTodo = _.findWhere(todos, {
		id: TodoId
	});
	if (matchedTodo) {
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo).send();
	} else {
		res.status(404).json({
			"error": "No record found with id: " + TodoId
		});
	}*/
});

app.put('/todos/:id', function(req, res) {
	var TodoId = parseInt(req.params.id);
	/*var matchedTodo = _.findWhere(todos, {
		id: TodoId
	});*/
	var body = _.pick(req.body, "description", "complete");
	var attributes = {};
	//var validAttributes = {};

	/*if (body.hasOwnProperty("complete") && _.isBoolean(body.complete)) {
		validAttributes.complete = body.complete;
	} else if (body.hasOwnProperty("complete")) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim().length > 0) {
		validAttributes.description = body.description
	} else if (body.hasOwnProperty("description")) {
		return res.status(400).send();
	}*/

	if (body.hasOwnProperty("complete")) {
		attributes.complete = body.complete;
	}

	if (body.hasOwnProperty("description")) {
		attributes.description = body.description
	}

	db.todo.findById(TodoId).then(function(todo){
		if(todo){
			todo.update(attributes);
			res.json(todo);
		}
		else
		{
			res.status(404).send();
		}
	}, function(e){
		res.status(500).send();
	});

	/*if (!matchedTodo) {
		return res.status(404).send();
	} else {
		_.extend(matchedTodo, validAttributes);
		res.json(matchedTodo);
	}*/
});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, "email", "password");
	/*var body = JSON.stringify(req.body);
	var temp = JSON.parse(body);*/
	//return res.json(temp);
	db.user.create(body).then(function(user){		
		res.json(user.toPublicJSON());
	},function(e){
		res.status(400).json(e);
	});
});

app.post('/users/login', function(req, res){
	var body = _.pick(req.body, "email", "password");
	if(typeof body.email!=='string' || typeof body.password!=='string')
	{
		res.status(400).send();
	}

	db.user.authenticate(body).then(function(user){
		res.header('Auth',user.generateToken('authenticate')).json(user.toPublicJSON());
	}, function(e){
		res.status(401).send();
	});

	/*db.user.findOne({
		where:{
			email: body.email
		}
	}).then(function(user){
		if(!user || !bcrypt.compareSync(body.password, user.get("password_hash")))
		{
			res.status(401).send();
		}
		res.json(user.toPublicJSON());
	}, function(){
		res.status(500).send();
	});*/
});

db.sequelize.sync().then(function(){
	app.listen(PORT, function() {
		console.log('Server running at port ' + PORT);
	});
});

