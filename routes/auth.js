const express = require('express');
const {body} = require('express-validator/check');
const user = require('../models/user');
const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

const router = express.Router();

router.post('/signup',[
    body('email').isEmail().withMessage('Please enter a valid email').custom((value,{req})=>{
        return user.findOne({email:value}).then(userDoc =>{
            if(userDoc){
                return Promise.reject('Email adress already exists');
            }
        })
    }).normalizeEmail(), 
    body('password').trim().isLength({min: 5}),
    body('name').trim().not().isEmpty()

],authController.signup);


router.post('/login',authController.login);

//extra=> status
router.get('/status',isAuth,authController.getStatus);
router.put('/status',isAuth,authController.changeStatus);

module.exports = router;