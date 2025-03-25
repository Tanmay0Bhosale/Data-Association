const express = require('express');
const app = express();
const userModel = require('./models/user');
const postModel = require('./models/post');

app.set('view engine' , 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/' , (req,res)=>{
    res.send("Helllo world!");
});

app.get('/create' , async (req,res)=>{
    let user = await userModel.create({
        username : "Tanmay",
        age : 21,
        email : 'tanmay@gmail.com'
    })
    res.send(user);
});

app.get('/posts/create' , async (req,res)=>{
    let post = await postModel.create({
        postdata : "This is a post",
        user : "67e17c774eb9dbcaa8fec588"
    })

    let users = await userModel.findOne({_id : "67e17c774eb9dbcaa8fec588"});
    users.posts.push(post._id);
    await users.save();

    res.send({post ,users});
});

app.listen(3000);