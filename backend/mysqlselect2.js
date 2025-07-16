var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

var qry =`SELECT * FROM employee;`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
   con.query(qry, function (err, results) {
      if (err) throw err;
      results.forEach((row) => {
         console.log(`ID: ${row['id']}, NAME: ${row['name']}, AGE: ${row['age']}, SALARY: ${row['salary']}`);
      });
   });
   con.end();
});