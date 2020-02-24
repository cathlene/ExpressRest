const User = require("../models/user");
const { validationResult } = require("express-validator/check");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("Validation failed, entered data is incorrect");
      error.statusCode = 422;
      error.date = errors.array();
      throw error; // when thrwoing error, exit the function execution
    }
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    bcrypt.hash(password,12)
        .then(hashedPw =>{
            const user = new User({
                email: email,
                password: hashedPw,
                name:name
            });
            return user.save();
        })
        .then(result =>{
            res.status(201).json({
                message: 'User created', userId:result._id
            })
        })
        .catch(err =>{
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err); 

        });


  };
  

  exports.login = (req, res, next) => {
   
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({email: email})
        .then(user =>{
            if(!user){
                const error = new Error("An user with this email could not be found");
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password,user.password);
        })
        .then(isEqual =>{
            if(!isEqual){
                const error = new Error("Wrong password");
                error.statusCode = 401;
                throw error;
            }
            // nadat email en password goed wijn ga je een token maken, deze token wil je aan de client geven
            const token = jwt.sign({
                email: loadedUser.email, userId: loadedUser._id.toString(), 
            },'secret',{expiresIn:'1h'}); // hier moet je eingelijk een lange string schrijven
            res.status(200).json({
                tokem: token, userId: loadedUser._id.toString()
            });
        })
        .catch(err =>{
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err); 

        })
    
  };
  

  exports.getStatus = (req, res, next) => {
   
    User.findById(req.userId)
        .then(user=>{
            if(!user){
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }
            res.status(200).json({  // je zet in json wat fronted wilt
                status: user.status

            })
        })
        .catch(err =>{
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err); 
        })
  };

  exports.changeStatus = (req, res, next) => {
   const newStatus = req.body.status;
    user.findById(req.userId)
        .then(user=>{
            if(!user){
                const error = new Error("User not found");
                error.statusCode = 404;
                throw error;
            }

            user.status = newStatus;
            return user.save(); 
        })
        .then(result =>{
            res.status(200).json({  // je zet in json wat fronted wilt
                message: 'User updated'
            })
        })
        .catch(err =>{
            if (!err.statusCode) {
                err.statusCode = 500;
              }
              next(err); 
        })
  };
  
  