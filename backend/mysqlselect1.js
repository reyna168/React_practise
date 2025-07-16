const mysql = require('mysql');
const con = mysql.createConnection({
   host: "localhost",
   user: "root",
   password: "",
   database: "mydb"
});

const qry =`SELECT name,salary FROM employee;`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
   con.query(qry, function (err, results) {
      if (err) throw err;
      console.log(results);
   });
   con.end();
});