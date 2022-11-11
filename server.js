if(process.env.NODE_ENV !== "production"){
    require("dotenv").config()
}


//Importing libraries that we installed using npm
const express = require("express")
var favicon = require('serve-favicon')
const app = express()
const bcrypt = require("bcrypt")
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
const methodOverride = require("method-override")
const mysql=require("mysql")


// making some directories public
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/images'));
app.use(favicon(__dirname + '/images/favicon.ico'));
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, //We wont resave session variable if nothing is changed
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride("_method"))



// data base connection
var db=mysql.createConnection(
    {
        const hostname : '0.0.0.0';
	const port : 3000;
        user: "root",
        password: "",
        database: "users"
    }
);

db.connect(function(error){
    if(error){
        console.log(error);
    }else{
        console.log("Database connected");
    }
})


app.post("/login", checkNotAuthenticated, async(req,res) => {
    try{
        
        var email = req.body.email;
        
        db.query(`SELECT * FROM MYTABLE WHERE email='${email}'`,
        function(err,result){
            if(err){
                console.log(err);

            }

            if(Object.keys(result).length > 0){
                var pass = req.body.password;
                bcrypt.compare(pass, result[0].password, function(err, flag) {
                    console.log(err);
                    if(flag)
                    res.render("../views/index.ejs",{name: result[0].name});
                });
                
            }
            else{
                res.redirect("/");
            }

        }
        )
    }catch(error){
        console.log(error);
    }
})


//Configuring the register post functionality
app.post("/register", checkNotAuthenticated, async (req,res) => {

    try {
        var name = req.body.name;
        var email = req.body.email;
        var password;
        bcrypt.hash(req.body.password, 2, function(err, hash) {
            console.log(err);
            password = hash;

            var sql = `INSERT INTO mytable (name,email,password) VALUES ( '${name}','${email}', '${password}')`;
        

            db.query(sql, function(err, result){
                if(err){
                    console.log(err);
                }else{
                    res.redirect("/login");
                }
            });

        });
        

        
    } catch (error) {
        console.log(error);
        res.redirect("/register")
    }
})


app.post("/adminPassword", async(req,res) => {
    console.log(1);
    var adminPass = req.body.password;
        
        if(adminPass === "root/admin"){
            res.redirect("/admin");
        }else{
            res.redirect("/adminPassword")
        }
    // try {
    //     pass = req.body.password;
        
    //     if(pass === "root-admin"){
    //         res.redirect("/admin");
    //     }else{
    //         res.redirect("/adminPassword")
    //     }
    // } catch (error) {
    //     console.log(error);
    // }
})


//Routes
app.get('/', checkAuthenticated, (req,res) => {
    res.render("../views/index.ejs", {name: req.user.name})
})

app.get('/login', checkNotAuthenticated, (req,res) => {
    res.render("../views/login.ejs")
})

app.get('/register', checkNotAuthenticated, (req,res) => {
    res.render("../views/register.ejs")
})

app.get('/adminPassword', (req,res) => {
    res.render("../views/admin-password.ejs");
})



app.get('/admin', (req,res) => {
    
    var que = "SELECT * FROM mytable ORDER BY id ASC";
    db.query(que, function(error, result){

        try {
            res.render("../views/admin.ejs", { action:'list', sampleData: result});
        } catch (error) {
            console.log(error);
        }
	})
})


// End Routes



app.delete("/logout", (req, res) => {
    req.logout(req.user, err => {
        if (err) return next(err)
        res.redirect("/")
    })
})

function checkAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

function checkNotAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}


db.query(`truncate users.mytable`);


app.listen(port, hostname, () => {
	console.log(`server running at http://${hostname}:${port}/`);
}
