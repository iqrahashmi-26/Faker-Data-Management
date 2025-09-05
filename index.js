const { faker } = require('@faker-js/faker');
const mysql = require("mysql2");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require('uuid');

app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,"public")));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"/views"));

const connection = mysql.createConnection({
    host:"localhost",
    user:"root",
    database:"sqlQuery",
    password:"Iqr@815351",
});

let getUser = (i) =>{
    return[
        faker.string.uuid().slice(0,100),
        (faker.internet.username()+i).slice(0,50),
        faker.internet.email().replace("@",`${i}@`).slice(0,100),
        faker.internet.password().slice(0,100)
    ];
};

//TO CHECK NO OF USERS
app.get("/",(req,res) =>{
    let q = `Select count(*) FROM users`;
    try{
    connection.query(q, (err,result) =>{
        if(err) throw err;
        let count = result[0]["count(*)"];
        res.render("home.ejs",{count});
    });
    }catch(err){
        console.log(err);
        res.send("some error caught");
    }
});

//SHOW ROUTE(DATA)
app.get("/user",(req,res) =>{
    let q = `SELECT * FROM users`;
    try{
    connection.query(q, (err,show) =>{
        if(err) throw err;
        res.render("user.ejs",{show});
    });
    }catch(err){
        console.log(err);
        res.send("some error caught");
    }
});

//Edit Route
app.get("/user/:id/edit",(req,res) =>{
    let {id} = req.params;
    let q = `SELECT * FROM users WHERE id='${id}'`;

    try{
    connection.query(q, (err, result) =>{
        if(err) throw err;
        let main = result[0];
        res.render("edit.ejs",{main});
    });
    }catch(err){
        console.log(err);
        res.send("some error caught");
    }
});

//Update Route
app.patch("/user/:id",(req,res) =>{
    let {id} = req.params;
    let q = `SELECT * FROM users WHERE id='${id}'`;
    let{password : formPass, username : newUsername} = req.body;

    try{
    connection.query(q, (err, result) =>{
        if(err) throw err;
        let main = result[0];
        if(formPass != main.password){
            res.send("Password is incorrect");
        }else{
            let q2= `UPDATE users SET username='${newUsername}' WHERE id='${id}'`;
            connection.query(q2, (err, result)=>{
                if(err) throw err;
                res.redirect("/user");
            });
        }
    });
    }catch(err){
        console.log(err);
        res.send("some error caught");
    }
});

//Adding Route
app.get("/user/new", (req,res) => {
    res.render("new.ejs");
});

app.post("/user/new", (req,res) =>{
    let {username,email,password} = req.body;
    let id = uuidv4();
    let q= "INSERT INTO users(id,username,email,password) VALUES (?,?,?,?)";
    
    connection.query(q,[id,username, email, password],(err, result) =>{
        if(err){
            console.log(err);
            return res.send("Some error Caught");
        }console.log("Added");
        res.redirect("/user");
    });

 });

 //Delete Route
 app.get("/user/:id/delete",(req,res) =>{
    let {id} = req.params;
    let q = `SELECT * FROM users WHERE id='${id}'`;

    try{
        connection.query(q,(err,result) =>{
            if(err) throw err;
            let main = result[0];
            res.render("delete.ejs",{main});
        });
    }catch(err){
        res.send("Some Error caught");
    }
 });

 app.delete("/user/:id/", (req,res) =>{
    let {id} = req.params;
    let {password} = req.body;
    let q2 = `SELECT * FROM users WHERE id = '${id}'`;
    try{
    connection.query(q2, (err, result) =>{
        if(err) throw err;
        let main = result[0];
        if(main.password != password){
            res.send("Password is incorrect");
        }else{
            let q2= `DELETE FROM users WHERE id='${id}'`;
            connection.query(q2, (err, result)=>{
                if(err) throw err;
                console.log(result);
                res.redirect("/user");
            });
        }
    });
    }catch(err){
        console.log(err);
        res.send("some error caught");
    }
 });

app.listen("8080", (req,res) =>{
    console.log("Server is listening to port 8080");
});

