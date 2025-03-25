const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { resolveInclude } = require('ejs');

app.set('view engine' , 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render("index");
});

app.get('/login',(req,res)=>{
    res.render("login");
});

app.get('/profile', isLoggedin,(req,res)=>{
    console.log(req.user);
    res.render("login");
});

app.post('/register', isLoggedin, async (req,res)=>{

    let {username,name,email,password,age} = req.body;
    let user = await userModel.findOne({email});

    if(user){
        return res.status(500).send("User already exists");
    }

    bcrypt.genSalt(10,(err,salt)=>{
        let hash = bcrypt.hash(password,salt, async(err, hash)=>{
            let createdUser = await userModel.create({
                name,
                username,
                email,
                age,
                password : hash
            })
            let token = jwt.sign({email : email , userid : createdUser._id}, "shhh")
            res.cookie('token',token);
            res.send("User created");
        });

    });
    
});

app.post('/login',async (req,res)=>{

    let {email,password} = req.body;
    let user = await userModel.findOne({email});

    if(!user){
        return res.status(500).send("User does not exist");
    }

    bcrypt.compare(password, user.password , (err,result)=>{
        if(result) {
            let token = jwt.sign({email : email , userid : user._id}, "shhh")
            res.cookie('token',token);
            res.status(200).send("User can login!");
        }
        else res.redirect("/login");
    })
    
});

function isLoggedin(req,res,next){
    if(req.cookies.token === "") res.send("You must be logged in!");
    else{
        let data = jwt.verify(req.cookies.token,"shhh");
        req.user = data;
        next();
    }
}

app.get('/logout',(req,res)=>{
    res.cookie('token','');
    res.redirect('/login');
});

app.listen(3000);