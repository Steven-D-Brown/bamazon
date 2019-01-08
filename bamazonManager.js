var mysql = require("mysql");
var inq = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

const manage = () => {
    inq.prompt({
        name: "opt",
        type: "list",
        message: "Which action would you like to take?",
        //using change inventory quantity instead of simply adding because this can account for inventory being damaged, stolen, etc.
        //additional functionality of renaming product in case of typos
        choices: ["View Products for Sale", "View Low Inventory", "Change Inventory Quantity", "Add New Product", "Rename Product", "Change Price", "Change Department", "Stop"]
    }).then(option => {
        switch (option.opt) {
            case "View Products for Sale":
                viewProducts();
                break;
            case "View Low Inventory":
                viewLow();
                break;
            case "Change Inventory Quantity":
                changeQuant();
                break;
            case "Add New Product":
                addNew();
                break;
            case "Rename Product":
                rename();
                break;
            case "Change Price":
                reprice();
                break;
            case "Change Department":
                changeDept();
                break;
            case "Stop":
                connection.end();
        }
    });
}

const viewProducts = () => {
    connection.query("SELECT * FROM products", (err, data) => {
        if(err) throw err;
        for (let i = 0; i < data.length; i++) {
            console.log("Product Name: " + data[i].product_name);
            console.log("Price: $" + data[i].price);
            console.log("Product ID: " + data[i].item_id);
            console.log("Product Department: " + data[i].department_name);
            console.log("Quantity in Stock: " + data[i].stock_quantity);
            console.log("--------------------------------------------------------------------");
        }

        manage();
    });
}

const viewLow = () => {
    connection.query("SELECT * FROM products WHERE stock_quantity < 5", (err, data) => {
        for (let i = 0; i < data.length; i++) {
            console.log("Product Name: " + data[i].product_name);
            console.log("Price: $" + data[i].price);
            console.log("Product ID: " + data[i].item_id);
            console.log("Product Department: " + data[i].department_name);
            console.log("Quantity in Stock: " + data[i].stock_quantity);
            console.log("--------------------------------------------------------------------");
        }

        manage();
    });
}

const changeQuant = () => {

    let itemIDList = [];
    connection.query("SELECT item_id FROM products", function (err, data) {
        for (let i = 0; i < data.length; i++) {
            itemIDList.push(data[i].item_id);
        }
    });

    inq.prompt([{
        name: "id",
        type: "input",
        message: "What is the ID of the item to change the quantiy of?",
        validate: function (value) {
            return itemIDList.indexOf(parseInt(value)) > -1;
        }
    },
    {
        name: "q",
        type: "input",
        message: "What is the new quantity of the item in stock?",
        validate: value => {
            if (isNaN(value) || value < 0 || value % 1 !== 0)
                return false;
            return true;
        }
    }]).then(answers => {
        connection.query("UPDATE products SET stock_quantity = ? WHERE item_id = ?", [answers.q, answers.id]);
        console.log("Quantity in stock now " + answers.q + ".");
        manage();
    });
}

const addNew = () => {

    let deptList = [];
    connection.query("SELECT DISTINCT department_name FROM departments", function(err,data){
        for(let i = 0; i < data.length; i++){
            deptList.push(data[i].department_name);
        }
    });
    
    inq.prompt([{
        name: "pn",
        type: "input",
        message: "What is the name of the new product?",
        validate: value =>{
            if(value === "")
                return false;
            return true;
        }
    },
    {
        name: "dept",
        type: "list",
        message: "Which department will this belong to?",
        choices: deptList
    },
    {
        name: "price",
        type: "input",
        message: "What will the price be?",
        validate: value => {
            if (isNaN(value) || round(value) <= 0)
                return false;
            return true;
        }
    },
    {
        name: "stock",
        type: "input",
        message: "How many of this product are in stock?",
        validate: value => {
            if (isNaN(value) || value < 0 || value % 1 !== 0)
                return false;
            return true;
        }
    }
    ]).then(data => {
        connection.query("INSERT INTO products SET product_name = ?, department_name = ?, price = ?, stock_quantity = ?", [data.pn, data.dept, round(data.price), data.stock], err => {
            if (err) throw err;
            console.log("Data entry successful.");
            manage();
        });
    });
}

const rename = () => {
    let itemList = [];
    connection.query("SELECT * FROM products", function (err, data) {
        for (let i = 0; i < data.length; i++) {
            itemList.push(data[i]);
        }
    });
    inq.prompt(
        {
            name: "id",
            type: "input",
            message: "What is the ID of the item you would like to select?",
            validate: function (value) {
                return containsID(itemList, parseInt(value));
            }
        }
    ).then(selID => {
        let selectedItem = itemList[parseInt(selID.id) - 1];

        console.log("Item ID " + selectedItem.item_id + ": " + selectedItem.product_name + " selected.");
        inq.prompt({
            name: "newName",
            type: "input",
            message: "What should the name of this item be?",
            validate: value =>{
                if(value === "")
                    return false;
                return true;
            }
        }).then(answer => {
            connection.query("UPDATE products SET product_name = ? WHERE item_id = ?", [answer.newName, selectedItem.item_id]);
            console.log("Product name now " + answer.newName + ".");
            manage();
        });
    });
}

const reprice = () => {

    let itemList = [];
    connection.query("SELECT * FROM products", function (err, data) {
        for (let i = 0; i < data.length; i++) {
            itemList.push(data[i]);
        }
    });

    inq.prompt(
        {
            name: "id",
            type: "input",
            message: "What is the ID of the item you would like to select?",
            validate: function (value) {
                return containsID(itemList, parseInt(value));
            }
        }
    ).then(selID => {
        let selectedItem = itemList[parseInt(selID.id) - 1];

        console.log("Item ID " + selectedItem.item_id + ": " + selectedItem.product_name + " selected.");
        inq.prompt({
            name: "newPrice",
            type: "input",
            message: "What should the price of this item be?",
            validate: value => {
                if (isNaN(value) || round(value) <= 0)
                    return false;
                return true;
            }
        }).then(answer => {
            connection.query("UPDATE products SET price = ? WHERE item_id = ?", [round(answer.newPrice), selectedItem.item_id]);
            console.log("Product price now $" + round(answer.newPrice + "."));
            manage();
        });
    });
}

const changeDept = () => {
    let itemList = [];
    connection.query("SELECT * FROM products", function (err, data) {
        for (let i = 0; i < data.length; i++) {
            itemList.push(data[i]);
        }
    });
    let deptList = [];
    connection.query("SELECT DISTINCT department_name FROM departments", function(err,data){
        if(err) throw err;
        for(let i = 0; i < data.length; i++){
            if(data[i].department_name)
            deptList.push(data[i].department_name);
        }
    });

    inq.prompt(
        {
            name: "id",
            type: "input",
            message: "What is the ID of the item you would like to select?",
            validate: function (value) {
                return containsID(itemList, parseInt(value));
            }
        }
    ).then(selID => {
        let selectedItem = itemList[parseInt(selID.id) - 1];

        console.log("Item ID " + selectedItem.item_id + ": " + selectedItem.product_name + " selected.");
        inq.prompt({
            name: "newDept",
            type: "list",
            message: "Which department is this item being moved to?",
            choices: deptList
        }).then(answer => {
            connection.query("UPDATE products SET department_name = ? WHERE item_id = ?", [answer.newDept, selectedItem.item_id]);
            console.log("Product department now " + answer.newDept + ".");
            manage();
        });
    });
}

const containsID = (arr, id) => {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].item_id === id)
            return true;
    }
    return false;
}

//used to guarantee acceptable format for prices
const round = x => {
    var xCent = x * 100;
    var deci = xCent - Math.floor(xCent);
    if (deci === 0)
        return xCent / 100;
    if (deci < 0.5)
        return Math.floor(xCent) / 100;
    return Math.ceil(xCent) / 100;
}

manage();