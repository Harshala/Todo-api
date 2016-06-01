var express = require('express');
var app = express();
var todoIdNext = 1;
var bodyParser = require('body-parser');

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

app.get('/',function(req, res){
	res.send('Todo Api running');
});

app.get('/todos', function(req, res){
	res.json(todos);
});

app.get('/todos/:id', function(req, res){
	var TodoId = parseInt(req.params.id);
	var matchedTodo;

	todos.forEach(function(todo){
		if(todo.id === TodoId)
		{
			matchedTodo = todo;
		}
	});
	if(matchedTodo)
	{
		res.json(matchedTodo);
	}
	else
	{
		res.status(404).send();
	}
});

app.post('/todos',function(req, res){
	var body = req.body;
	body.id = todoIdNext++;
	todos.push(body);
	res.json(body).send();
});

app.listen(PORT, function(){ console.log('Server running at port '+ PORT); });