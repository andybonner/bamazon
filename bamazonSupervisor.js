const mysql = require("mysql");
const inquirer = require("inquirer");
// the console.table module extends the native 'console' object, so it doesn't need a var of its own
require("console.table");

// configure MySQL connection
let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Si2tmotmml?",
  database: "bamazon"
});

// connect to db, then initiate UI
connection.connect(function (err) {
  if (err) throw err;
  runSupervisor();
});

function runSupervisor() {
  inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View product sales by department', 'Create a new department']
    }
  ])
  .then(function(answer){
    switch (answer.choices) {
      case 'View product sales by department':
        viewDepts();
        break;
      case 'Create a new department':
        createDept();
        break;
      default:
        console.log("Error, starting over...");
        runSupervisor();
        break;
    }
  });
}

function viewDepts() {
  
}

function createDept() {
  
}