var mysql = require("mysql");
var inq = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",

    port: 3306,

    user: "root",

    password: "",
    database: "bamazon"
});

const purchase = () => {
    connection.query("SELECT * FROM products", function (err, data) {
        let itemIDList = [];
        for (let i = 0; i < data.length; i++) {
            if (data[i].stock_quantity < 1) //dont list what we don't have
                continue;
            itemIDList.push(data[i].item_id);
        }
        display(data);
        inq.prompt({
            name: "option",
            type: "input",
            message: "Input 'close' if you want to end the program or 'display' if you want to display the items again."
            + "\n  Otherwise, what is the id of the item you would you like to order?",
            validate: function (value) {
                if (value.trim() === "close") {
                    connection.end();
                    connection.end();
                }
                if (value.trim() === "display")
                    return display(data); //will return false, but will also re-display the information 
                return itemIDList.indexOf(parseFloat(value)) > -1;
            }
        }).then(answer => {
            let chosenItem = identify(data, parseInt(answer.option));
            inq.prompt([{
                name: "quantity",
                type: "input",
                message: chosenItem.product_name + " chosen. " + chosenItem.stock_quantity + " left in stock. How many would you like to order?",
                validate: value => {
                    if (value.trim() === "" || isNaN(value) || value < 0 || value % 1 !== 0)
                        return false;
                    if (value > chosenItem.stock_quantity) {
                        console.log("\nSorry but we do not have that many of this item. Please choose a smaller number.");
                        return false;
                    }
                    return true;
                }
            }]).then(quant => {
                if (quant.quantity > 0) {
                    connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [chosenItem.stock_quantity - quant.quantity, chosenItem.item_id], err => {
                        console.log("\nOrder confirmed.");
                        console.log(quant.quantity + " ordered of item: " + chosenItem.product_name + ".");
                        let money = betterRounder(quant.quantity * chosenItem.price);
                        console.log("Total Price: $" + money + "\n");
                        connection.query("SELECT department_id, product_sales FROM products RIGHT JOIN departments ON products.department_name = departments.department_name WHERE item_id = ?", [chosenItem.item_id], (err, deptInfo)=>{
                            connection.query("UPDATE departments SET product_sales = ? WHERE department_id = ?", [deptInfo[0].product_sales += money, deptInfo[0].department_id], err =>{
                                if(err) throw err;
                            });
                        });
                        
                        goOn();
                    });
                }
                else {
                    console.log("\nNo order requested.\n");
                    goOn();
                }
            });
        });
    });
}

const goOn = () => {
    inq.prompt([{
        name: "cont",
        type: "list",
        choices: ["Continue Shopping", "I'm Done"],
        message: "Would you like to continue shopping or are you done for now?"
    }]).then(ans => {
        if (ans.cont === "I'm Done") {
            connection.end();
            return;
        }
        else
            purchase();
    });
}

const display = (data) => {
    console.log("");
    for (let i = 0; i < data.length; i++) {
        if (data[i].stock_quantity < 1) //dont list what we don't have
            continue;
        console.log("Product Name: " + data[i].product_name);
        console.log("Price: $" + data[i].price);
        console.log("Product ID: " + data[i].item_id);
        console.log("Quantity in Stock: " + data[i].stock_quantity);
        console.log("--------------------------------------------------------------------");
    }
    console.log("");

    //necessary for validation calls
    return false;
}

const identify = (data, id) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].item_id === id) {
            return data[i];
        }
    }
}

//exists to fix minor monetary rounding errors
const betterRounder = x => {
    var xCent = x * 100;
    var deci = xCent - Math.floor(xCent);
    if (deci === 0)
        return xCent / 100;
    if (deci < 0.5)
        return Math.floor(xCent) / 100;
    return Math.ceil(xCent) / 100;
}

purchase();