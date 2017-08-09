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
  runManager();
});

function runManager() {
  inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View products for sale', 'View low inventory', 'Add to inventory', 'Add new product']
    }
  ])
  .then(function(answer) {
    switch (answer.action) {
      case 'View products for sale':
        viewProducts();
        break;
      case 'View low inventory':
        viewLowInv();
        break;
      case 'Add to inventory':
        addInv();
        break;
      case 'Add new product':
        addProduct();
        break;
    }
  });
}