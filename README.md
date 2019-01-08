# bamazonCustomer

To use the bamazonCustomer app, run it from Node with the command `node bamazonCustomer.js`.

It will then list products you may purchase. Items not in stock will not be displayed. It includes the product name, the price, the quantity in stock, and the product ID. It then prompts you to input the ID for the product you wish to buy, the word "close" (no quotes) if you want to end the program, or the word "display" if you want to print the list of items again. If you type "close", the program will end. If you type "display", (again, no quotes) the information will be displayed again and you will be given the same prompt again.

If you input a valid ID, Node will tell you which item you have selected and how many of the product are in stock and ask you how many you would like to order. Inputting 0 will not purchase any. If you try to order more than the quantity in stock, Node will tell you the quantity ordered is too great and you must choose a smaller quantity. You may not sell to bamazon by choosing a negative number.

After you have placed your order, you will be given an order confirmation containing the name and quantity of the ordered item as well as the total price. You are then given the options Continue Shopping or I'm Done. Continue Shopping will display the item information again and allow you to make more purchases. I'm Done will close out of the app.

NOTE TO SUPERVISORS: Purchases from this program will automatically update product sales tied to departments.

#bamazonManager

To use the bamazonManager app, run it from Node with the command `node bamazonCustomer.js`.

You will then be given a list of options to choose from. You may view all products, view only products with a low inventory (less than 5 in stock), change the quantity in stock, add a new product, rename an existing product, change the price of a product, change the department to which a product belongs, or stop the program.

Viewing either list of products will generate a list of products including the product's name, price, ID, department, and quantity in stock. Either list will include products with 0 items in stock.

Changing inventory quantity, renaming a product, changing a product's price, or changing the department to which a product belongs all have a fairly similar flow. You will be prompted to input a product's ID first. After inputting a valid ID, you will be prompted to input the new information for the product. To change the amount in stock, you must input a non-negative integer value. To rename a product, you will need to input a name. To change the price, you must input a postive number. Any positive number you input will be properly rounded to give a price with no more than 2 decimal places to account for cents. No more than 10 spaces before the decimal will be accepted, so products priced at or above $10 billion will have to be sold elsewhere. If you input a number that would be rounded to $0.00, the input will not be accepted. Changing the department will prompt you to choose the department to which the product should belong from a list of existing departments.

Adding a new product will prompt you to input a product name, a department to which the product should belong, a price for the product, and a quantity in stock. The ID will be automatically generated. The same rules that apply to changing data apply to inputting new data. That is, there needs to be a name for the product, the product needs a positive price, and there must be a non-negative quantity in stock.

After completing any one of these functions, the program will return to the list of tasks you can perform.

When you are done, you may select the Stop option to close the application.
