require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 8000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB সংযোগের লিংক
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1zlbxqs.mongodb.net/?appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // ডেটাবেসের সাথে সংযোগ
    await client.connect();

    const db = client.db("simpleCrud");
    const usersCollection = db.collection("users");

    //get users all data
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get single user data
    app.get("/users/:id", async (req, res) => {
      //console.log(req);
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const user = await usersCollection.findOne(query);
      res.send(user);
    });

    // add single user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      //console.log("Adding new user:", newUser);
      const result = await usersCollection.insertOne(newUser);
      res.send(result);
    });

    //Update user
    app.patch("/users/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const modifiedUser = req.body;
      const updatedDocument = {
        $set: {
          name: modifiedUser.name,
          email: modifiedUser.email,
          role: modifiedUser.role,
        },
      };
      const result = await usersCollection.updateOne(filter, updatedDocument);

      res.send(result);
    });

    // delete single user (data mutation in lib folder)
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id),
      };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } catch (err) {
    console.error("MongoDB connection failed:", err);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
