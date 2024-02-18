const express = require('express')
const app = express() // Initializing Express app
const http = require('http').Server(app)
const mongoose = require('mongoose')
const port = 1000 // Setting up port for the server

// Replace the placeholder with your Atlas connection string
const uri = "mongodb+srv://root:root@cluster0.tkxxgty.mongodb.net/express_decoupled?retryWrites=true&w=majority"

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const { MongoClient, ServerApiVersion } = require("mongodb");
// const client = new MongoClient(uri,  {
//         serverApi: {
//             version: ServerApiVersion.v1,
//             strict: true,
//             deprecationErrors: true,
//         }
//     }
// );

// async function run() {
//   try {
//     // Connect the client to the server (optional starting in v4.7)
//     await client.connect();

//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

// // Route to get products
// app.get('/products', async (req, res) => {
//     try {
//         const products_data = await products.find();
//         res.status(200).send(products_data);
//     } catch (error) {
//         res.status(500).send({ message: error.message });
//     }
// });


mongoose.connect(uri)

const Products = require("./schema/products")
const Orders = require("./schema/orders")
app.use(express.json())


/** -----------------------   -----  PRODUCTS API CALLS ----- - ----------------- */
// Retrieve all the products
app.get("/products", async (req, res) => {

    try {

        const productlist = await Products.find()
        return res.status(200).send(productlist)
    } catch (error) {
        return res.status(500).send({ message: error.message })
    }
})


// Add a new product to database.
app.post('/addProducts', async (req, res) => {
    try {
        // console.log(req.body)
        const { name, desc, price, stock, img } = req.body
        if (!name || !price || !stock) {
            return res.status(400).send("name, price, stock are required fields.")
        }
        // Use Create to create a new product and directly save
        // await Product.create({ name, desc, price, stock, img })
        // intialise a new product and then save to DB
        const newProduct = await Products.create({ name, desc, price, stock, img })
        return res.status(201).send("Product added successfully")
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
});


// Update an existing product
app.put('/updateProducts/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const { name, desc, price, stock, img } = req.body
        const updatedProduct = await Products.findByIdAndUpdate(productId, { name, desc, price, stock, img }, { new: true });
        if (!updatedProduct) {
            return res.status(404).send("Product not found")
        }
        res.status(202).send("Product details modified successfully")
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


// Route to delete a product
app.delete('/deleteProducts/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        const deletedProduct = await Products.findByIdAndDelete(productId)
        if (!deletedProduct) {
            return res.status(404).send("Product not found")
        }
        res.status(200).send("Product removed successfully")
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})


/** -----------------------   -----  ORDER API CALLS ----- - ----------------- */

//Retirve all the orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Orders.find()
        return res.status(200).send(orders)
    }
    catch (e) {
        console.log(error.message)
        return res.status(500).send("Unable to retrieve the Orders.")
    }
})

app.post('/placeOrder/:id', async (req, res) => {
    try {
        const product = await Products.findById(req.params.id)
        if (!product) {
            return res.status(404).send({ message: "Product not found." })
        }

        if (req.body.quantity <= 0) {
            return res.status(400).send({ message: "Invalid order quantity." })
        }

        if (req.body.quantity > product.stock) {
            return res.status(400).send({ message: "Insufficient stock." })
        }
        product.stock -= req.body.quantity
        await product.save()

        const orderDetails = {
            productId: product._id,
            productName: product.name,
            address: req.body.address,
            quantity: req.body.quantity,
            delivery_status: 'Pending',
            cost : product.price*parseInt(req.body.quantity)
        }
        const newOrder = await Orders.create(orderDetails)
        return res.status(201).send("Order placed successfully.")
    }
    catch (err) {
        return res.status(500).send({ message: err.message })
    }
})


//Cancel an order by id
app.post('/orders/:id/cancel', async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await Orders.findById(orderId)
        if (!order) {
            return res.status(404).send("Order not found")
        }
        if (order.delivery_status === 'Pending') {
            await Orders.findByIdAndDelete(orderId);
            return res.status(200).send("Order cancelled successfully")
        } else if (order.delivery_status === 'Delivered') {
            order.delivery_status = 'Returning'
            await order.save()
            return res.status(200).send("Your order will be picked up soon by our delivery agent")
        } else {
            return res.status(400).send("Invalid delivery status")
        }
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

// Get the current status of an Order
app.get('/orders/:id/deliveryStatus', async (req, res) => {
    try {
        const orderId = req.params.id
        const order = await Orders.findById(orderId)
        if (!order) {
            return res.status(404).send("Order not found")
        }
        return res.json({ delivery_status: order.delivery_status })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

/** ----- ----------------------------Search ---------------------- - --- - ------- */
app.get('/search', async (req, res) => {
    try {
        const query = req.query.q
        const products = await Products.find({
            $or: [
                { name: { $regex: query, $options: 'i' } }, //search query in name
                { desc: { $regex: query, $options: 'i' } }  // search query in description
            ]
        })
        if(!products){
            return res.status(404).send("Product not found. Try again later.")
        }
        return res.status(200).send(products)
        
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
});

app.listen(port, () => console.log("Server Starting"))