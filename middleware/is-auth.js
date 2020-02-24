const jwt = require('jsonwebtoken');

module.exports = (req,res,next) =>{
    const authHeader = req.get('Authorization');
    if(!authHeader){
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }


    const token = authHeader.split(' ')[1];
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,'secret') // verify = decode + verify, secret is hetzelfde als wat je in je login hebt geschreven bij het aanmaken van de token
    }catch (err){
        err.statusCode = 500;
        throw err;
    }
    if(!decodedToken){ // if its undefinied
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId; // als alles goed is gegaan zet je de userid in request
    next();
}