const {MongoClient} = require('mongodb');

async function main(){

   const uri = "mongodb://localhost:27017";
   //const uri = "mongodb+srv://user:mypwd@cluster0.zhmrg1h.mongodb.net/?retryWrites=true&w=majority";
   
   const client = new MongoClient(uri);

   try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Make the appropriate DB calls

      // insert documents
      await createdocs(client, [
         {'ProductID':1, 'Name':'Laptop', 'price':25000},
         {'ProductID':2, 'Name':'TV', 'price':40000},
         {'ProductID':3, 'Name':'Router', 'price':2000},
         {'ProductID':4, 'Name':'Scanner', 'price':5000},
         {'ProductID':5, 'Name':'Printer', 'price':9000}
      ]);
  
   } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
   }
}

main().catch(console.error);

async function createdocs(client, docs){
   const result = await client.db("mydb").collection("products").insertMany(docs);
   console.log(`${result.insertedCount} new document(s) created with the following id(s):`);
   console.log(result.insertedIds);
}