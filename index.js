const express = require('express');
const cors = require('cors');
const {
    MongoClient,
    ServerApiVersion,
    ObjectId
} = require('mongodb');
require('dotenv').config();

const app = express();

const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wsbi62n.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect(); 

        // making a collection in the phoneDB database
        const phoneCollection = client.db('phoneDB').collection('phone');

        // read data
        app.get('/phones', async(req, res) =>{
            const cursor = phoneCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        // read specific data
        app.get('/phones/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id: new  ObjectId(id) }
            const result = await phoneCollection.findOne(query);
            res.send(result);
        })

        // update specific data

        app.put('/phones/:id', async(req, res) =>{
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedPhone = req.body;
            const phone = {
                $set: {
                    name: updatedPhone.name,
                    brandName: updatedPhone.brandName,
                    price: updatedPhone.price,
                    type: updatedPhone.type,
                    details: updatedPhone.details,
                    photo : updatedPhone.photo
                }
            }
            const result = await phoneCollection.updateOne(filter, phone, options )
            res.send(result);
        })

        // Post data of phone to mongodb form Add phone (Create)
        app.post('/phones', async(req, res) =>{
            const newPhone = req.body;
            console.log(newPhone);
            const result = await phoneCollection.insertOne(newPhone);
            res.send(result);
        })
        // to delete data 
        app.delete('/phones/:id', async(req, res) =>{
            const id = req.params.id;
            const query = { _id : new ObjectId(id) };
            const result = await phoneCollection.deleteOne(query);
            res.send(result);
        })
        // Send a ping to confirm a successful connection
        await client.db("admin").command({
            ping: 1
        });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('This server is running')
})

app.listen(port, () => {
    console.log(`this server is running at port: ${port}`);
})