const express = require('express');
const app = express();
app.set('view engine' , 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.get('/' , (req,res)=>{
    res.send("Helllo wprld!");
});

app.listen(3000);