var Sequelize = require("Sequelize");
var sequelize;
var env = Process.env.NODE_ENV || "development";

if(env==="production")
{
	sequelize = new Sequelize(Process.env.DATABASE_URL,{
		dialect: "postgres"
	});
}
else
{
	sequelize = new Sequelize(undefined, undefined, undefined,{
	dialect:"sqlite",
	storage: __dirname + "/data/dev-todo-api.sqlite"
});

var db = {};
db.todo = sequelize.import(__dirname+'/models/todo.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;