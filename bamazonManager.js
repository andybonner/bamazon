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
  console.log("/////////////////////////////////////////////");
  inquirer.prompt([
    {
      name: 'action',
      type: 'list',
      message: 'What would you like to do?',
      choices: ['View products for sale', 'View low inventory', 'Add more units of an existing product to inventory', 'Add new product']
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
      case 'Add more units of an existing product to inventory':
        addInv();
        break;
      case 'Add new product':
        addProduct();
        break;
      default:
        console.log("Error, starting over...");
        runManager();
        break;
    }
  });
}

function viewProducts() {
  connection.query("SELECT * FROM products ORDER BY item_id", function (err, results) {
    if (err) throw err;
    console.log("Current inventory:");
    console.table(results);
    runManager();
  });
}

function viewLowInv() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 5 ORDER BY stock_quantity;", function (err, results) {
    if (err) throw err;
    console.log("Items with fewer than 5 units in stock:");
    console.table(results);
    runManager();
  });
}

function addInv() {
  // prefill an array with the products for inquirer to use
  let choiceArray = [];
  connection.query("SELECT * FROM products", function (err, results) {
    if (err) throw err;
    // concatenate each row's item_id, product_name, and stock_quantity into a single string, to become a line in inquirer's 'choices', and later split to re-access those values
    results.forEach(row => choiceArray.push(row.item_id + ". " + row.product_name + "  -- " + row.stock_quantity + " in stock)"));
    
    inquirer.prompt([
      {
        name: 'productChoice',
        type: 'list',
        message: 'Which product would you like to restock?',
        choices: choiceArray
      },
      {
        name: 'newQuantity',
        type: 'input',
        message: 'How many units would you like to add?'
      }
    ])
    .then(function(answers){
      // UPDATE db row WHERE item_id is harvested from the beginning of inquirer's answer.productChoice, and current quantity from the end
      let itemId = answers.productChoice.split(".")[0];
      let currentQuantity = answers.productChoice.split(" -- ")[1].split(" ")[0];
      let totalQuantity = parseInt(currentQuantity) + parseInt(answers.newQuantity);
      // prebuild query
      let query = "UPDATE products SET stock_quantity=" + totalQuantity + " WHERE item_id=" + itemId;
      connection.query(query, function (err) {
        if (err) throw err;
        console.log("Product updated! Now:");
        // get updated data
        connection.query("SELECT * FROM products WHERE item_id=" + itemId, function(err, results){
          console.table(results);
          runManager();
        });
      });
    });
  });
}

function addProduct() {
  inquirer.prompt([
    {
      name: 'product_name',
      type: 'input',
      message: 'What is the new product\'s name?'
    }, {
      name: 'department_name',
      type: 'input',
      message: 'What department is it in?'
    }, {
      name: 'price',
      type: 'input',
      message: 'What is the price per unit?'
    }, {
      name: 'stock_quantity',
      type: 'input',
      message: 'How many units are in stock?'
    }
  ])
  .then(function(answers){
    connection.query("INSERT INTO products SET ?", answers, function(err, results){
      if (err) throw err;
      console.log("Product successfully added!");
      // console.table the new db row. The response from the INSERT query include a key "insertId," which can let us reference the new row.
      connection.query("SELECT * FROM products WHERE item_id=" + results.insertId, function(err, results){
        console.table(results);
        runManager();
      });
    });
  });
}