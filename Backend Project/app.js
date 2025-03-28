const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      crypto.randomBytes(12, function(err,bytes){
        const fn = bytes.toString('hex') + path.extname(file.originalname);
        cb(null, fn)   
      })
    }
  })
  
  const upload = multer({ storage: storage })


app.set('view engine' , 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.get('/',(req,res)=>{
    res.render("index");
});

app.get('/test',(req,res)=>{
    res.render("test");
});

app.post('/upload', upload.single("image"),(req,res)=>{
    console.log(req.file);
});

app.get('/login',(req,res)=>{
    res.render("login");
});

app.get('/profile', isLoggedin,async (req,res)=>{
    let user = await userModel.findOne({email : req.user.email}).populate('posts');
    res.render("profile",{user});
});

app.get('/like/:id', isLoggedin,async (req,res)=>{
    let post = await postModel.findOne({_id : req.params.id}).populate('user');
    
    if(post.likes.indexOf(req.user.userid) === -1){
        post.likes.push(req.user.userid);
    }else{
        post.likes.splice(post.likes.indexOf(req.user.userid),1);
    }
    await post.save();
    res.redirect("/profile");

});

app.get('/edit/:id', isLoggedin,async (req,res)=>{
    let post = await postModel.findOne({_id : req.params.id}).populate('user');
    res.render("edit" , {post});
});

app.post('/update/:id', isLoggedin,async (req,res)=>{
    let post = await postModel.findOneAndUpdate({_id : req.params.id} , {content : req.body.content});
    res.redirect("/profile");

});

app.post('/posts', isLoggedin,async (req,res)=>{
    let user = await userModel.findOne({email : req.user.email});
    let {content} = req.body;
    let post = await postModel.create({
        content,
        user : user._id
    });
    user.posts.push(post._id);
    await user.save();
    res.redirect('/profile');

    
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
            res.status(200).redirect("/profile");
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