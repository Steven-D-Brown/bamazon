var mysql = require("mysql");
var inq = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

const supervise = () => {

    inq.prompt({
        name: "act",
        type: "list",
        message: "What would you like to do?",
        choices: ["Create New Department", "View Product Sales by Department", "Close"]
    }).then(ans => {
        switch (ans.act) {
            case "Create New Department": newDept();
                break;
            case "View Product Sales by Department": viewSales();
                break;
            case "Close": connection.end();
                break;
        }
    });
}

const viewSales = () => {

    // instantiate
    var table = new Table({
        head: ['Department ID', 'Department Name', 'Over Head Costs', 'Product Sales', 'Total Profit'],
        colWidths: [15, 22, 22, 22, 22]
    });

    connection.query("SELECT * FROM departments", (err, data) => {
        if (err) throw err;
        for (let i = 0; i < data.length; i++){
            let prof = round(data[i].product_sales - data[i].over_head_costs);
            let profString = "$" + Math.abs(prof);
            if(prof < 0)
                profString = "-" + profString;
            table.push([data[i].department_id, data[i].department_name, "$" + data[i].over_head_costs, "$" + data[i].product_sales, profString]);        
        }
        console.log(table.toString());
        supervise();
    });
}

const newDept = () => {

    let deptList = [];
    connection.query("SELECT * FROM departments", (err, data) => {
        if (err) throw err;
        for (let i = 0; i < data.length; i++)
            deptList.push(data[i].department_name.toLowerCase());
    });

    inq.prompt([{
        name: "name",
        type: "input",
        message: "What should the new department be called?",
        validate: value => {
            if (!value.trim() || value.trim().length > 20)
                return false;
            if (deptList.indexOf(value.trim().toLowerCase()) !== -1) {
                console.log("\nA department with that name already exists. Please enter a unique name.");
                return false;
            }
            return true;
        }
    },
    {
        name: "cost",
        type: "input",
        message: "What is the total over head cost of the department?",
        validate: value => {
            if (value.trim() === "" || isNaN(value) || round(value) < 0 || value >= 10000000000000)
                return false;
            return true;
        }
    }]).then(dept => {
        connection.query("INSERT INTO departments SET over_head_costs = ?, department_name = ?, product_sales = 0", [round(dept.cost), dept.name.trim()], err => {
            if (err) throw err;

            console.log("New department created: " + dept.name.trim());

            supervise();
        });
    });
}

const round = x => {
    var xCent = x * 100;
    var deci = xCent - Math.floor(xCent);
    if (deci === 0)
        return xCent / 100;
    if (deci < 0.5)
        return Math.floor(xCent) / 100;
    return Math.ceil(xCent) / 100;
}

supervise();