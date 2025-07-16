const {MongoClient} = require('mongodb');

async function main(){

   const uri = "mongodb://localhost:27017/";

   const client = new MongoClient(uri);

   try {
      // Connect to the MongoDB cluster
      await client.connect();
        
      await newcollection(client, "mydatabase");
   } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
   }
}

main().catch(console.error);


async function newcollection (client, dbname){
   const dbobj = await client.db(dbname);
   const collection = await dbobj.createCollection("MyCollection");
   console.log("Collection created");
   console.log(collection);
}
