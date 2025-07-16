var mysql = require('mysql');
var con = mysql.createConnection({
   host: "localhost",
    user: "root",
   password: "",
   database: "mydb"
});
var data = [
   ["Ravi", 25, 25000],
   ["Anil", 26, 30000],
   ["Meena", 26, 27000]
];
var qry =`INSERT INTO employee (name, age, salary) VALUES(?,?,?);`;
con.connect(function (err) {
   if (err) throw err;
   console.log("Connected!");
   for (var i=0;i<data.length; i++){
      con.query(qry,data[i], function (err, result) {
         if (err) throw err;
         console.log("New Record inserted successfully");
      })
	};
   con.end();
});