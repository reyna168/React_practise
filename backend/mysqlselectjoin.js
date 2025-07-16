var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

var qry =`SELECT name,salary FROM employee WHERE salary>25000 and salary>30000;`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
  
   con.query(qry, function (err, results) {
      if (err) throw err;
      console.log(results);
   });

   con.end();
   
});