const express = require('express');
const bodyParser = require('body-parser')
const feedRoutes = require('./routes/feed');
const authRoutes = require('./routes/auth');

const mongoose = require('mongoose');
const app = express();
const path = require('path');



app.use(bodyParser.json()); //application/json

//another middleware voor elke keer als die naar /images gaat
app.use('/images',express.static(path.join(__dirname,'images')));

app.use((req,res,next)=>{ // now every response ze send will have these headers
    res.setHeader('Access-ControL-Allow-Origin','*'); // dit maakt het mogelijk dat front en back beiden naar andere poorten kunnen luisteren
    res.setHeader('Access-ControL-Allow-Methods','GET, POST, PUT, PATCH, DELETE'); 
    res.setHeader('Access-ControL-Allow-Headers','Content-Type, Authorization'); 
    next();
})

app.use('/feed',feedRoutes); 
app.use('/auth',authRoutes); 


//another middleware for error handling
app.use((error,req,res,next) =>{
    const status = error.statusCode || 500; // in case statuCode is undefined you take 500
    const message = error.message;
    const data = error.data;
    res.status(status).json({
        message:message, data : data
    });
});

mongoose.connect("mongodb://localhost:27017/messages")
    .then(()=>{app.listen(8080);})
    .catch(err =>{
        console.log(err);
    });
