import {MongoClient, ServerApiVersion} from "mongodb";

const uri = process.env.MONGO_URI || "";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Find user by email function: part 1 step 4
export async function getUserByEmail(userEmail:string) {
    try {
        await client.connect();

        const db = client.db(process.env.MONGO_DATABASE);

        return await db.collection("users").findOne();
    } catch(error) {
        console.error(error.message);
  } finally {
    await client.close();
    }
};