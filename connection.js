/*We have to run this file only once (In the beginning of this project), so that the DB and table will be created. After that we can only run the file which contains the APIs to perform the operations*/

const mysql = require('mysql2')
require('dotenv').config()

const connection = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PWD
})

connection.connect((err)=>{
    if(err){
         console.error("Connection Error",err)
         return
    }
    console.log("Connected to Server Successfully")

    //Creating a DB
    connection.query('CREATE DATABASE test_db',(err)=>{
        if(err){
            console.error("Error creating Database",err);
            return;
        }
        console.log("Database Created Successfully")
    })

    connection.query('USE test_db',(err)=>{
        if(err){
            console.error("Error using the Database",err);
            return;
        }
        console.log("Using the database");
        
    })

    //Creating School Table
    const tablequery = `CREATE TABLE SCHOOLS(
    ID INT AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(50),
    ADDRESS VARCHAR(100),
    LATITUDE FLOAT,
    LONGITUDE FLOAT); `;

    connection.query(tablequery,(err)=>{
        if(err){
            console.error("Error Creating the table",err);
            return;
        }
        console.log("Successfully created the table");
    })
})
