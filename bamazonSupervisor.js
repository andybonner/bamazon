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
  console.log("/////////////////////////////////////////////");
  inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View product sales by department', 'Create a new department']
    }
  ])
  .then(function(answer){
    switch (answer.action) {
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
  let query = `
    SELECT departments.department_id, departments.department_name, departments.overhead_costs,
    sum(products.product_sales) AS product_sales, (product_sales - departments.overhead_costs) AS total_profit
    FROM products
    INNER JOIN departments ON products.department_name = departments.department_name
    GROUP BY products.department_name;
  `
  connection.query(query, function(err, res){
    console.table(res);
    runSupervisor();
  })
}

function createDept() {
  
}