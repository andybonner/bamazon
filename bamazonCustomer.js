const mysql = require("mysql");
const inquirer = require("inquirer");
// the console.table module extends the native 'console' object, so it doesn't need a var of its own
require("console.table");
let productChoice;

let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Si2tmotmml?",
  database: "bamazon"
});

// connect to db, then initiate sale flow
connection.connect(function (err) {
  if (err) throw err;
  runSale();
});

function runSale() {
  // fetch and display db data
  let query = connection.query("SELECT * FROM products ORDER BY item_id", function (err, results) {
    if (err) throw err;
    console.log(results);
    console.log("/////////////////////////////////////////////"
      + "\nOur inventory:");
    console.table(results);
    // get user's choice of product
    inquirer.prompt([
      {
        name: "product_name",
        type: "list",
        message: "Which product would you like to buy?",
        choices: function () {
          let choiceArray = [];
          results.forEach(product => choiceArray.push(product.product_name));
          return choiceArray;
        }
      }
    ])
    .then(answer => {
      // store db row for chosen product in productChoice
      results.forEach(function(product) {
        if (product.product_name === answer.product_name) {
          productChoice = product;
        }
      });
      console.log(productChoice.stock_quantity);
      // get user's quantity desired
      inquirer.prompt([
        {
          name: "quantity",
          type: "input",
          message: "How many would you like to buy?",
          validate: input => {
            // check against inventory available; if user asks for too much, prompt won't continue
            return input <= productChoice.stock_quantity || "Sorry, we don't have that many in stock. Try again!";
          }
        }
      ])
      .then(answer => {
        console.log("answer 2", answer);
        console.log("productChoice:", productChoice)
        // deduct db inventory by answer.quantity (to num)
        connection.query(
          "UPDATE products SET ? WHERE ?",
          [
            {stock_quantity: (productChoice.stock_quantity - answer.quantity)},
            {item_id: productChoice.item_id}
          ],
          function(err){
            if (err) throw err;
            console.log("OK, it's yours!");
            runSale();
          }
        );
      });
    });
  });
}