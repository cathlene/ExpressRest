const { validationResult } = require("express-validator/check");
const Post = require("../models/post");
const User = require('../models/user');

exports.getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      //geen render meer want we werken nu met back en front apart
      res
        .status(200)
        .json({ message: "fetched posts succesfully", posts: posts });
    })
    .catch(err => {
      if (err.statusCode) {
        err.statusCode = 500;
      }
      next(err); //Wanneer je in async code zit, kan je error niet throwen je kan enkel next doen
    });
};

exports.postPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error; // when thrwoing error, exit the function execution
  }
  const title = req.body.title;
  const content = req.body.content;
  let creator;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck.jpg", 
    creator:  req.userId   // now when creating a post, it will be assigned to that user
  });
  post
    .save()
    .then(result => {
      // now you also want to add that post to the list of user posts
      return User.findById(req.userId);
    })
    .then( user=>{
      creator = user;
      user.posts.push(post); // access posts of user and push the new one there
      // user is updated so save him again
      return user.save();
    
    })
    .then(result =>{
      res.status(201).json({
        // 201 success + resource created, 200 enkel succes
        // no render anymore want we werken niet meer met view maar met json
        message: "hello",
        post: post,
        creator: {_id:creator._id, name: creator.name}
      });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); //Wanneer je in async code zit, kan je error niet throwen je kan enkel next doen
    });
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId; // get postId uit URL met params ipv body
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; // hier kan je wel throwen want nu gaat de next catch block worden aangesproken die dan next doet
      }

      res.status(200).json({ message: "Post fetched", post: post });
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err); //Wanneer je in async code zit, kan je error niet throwen je kan enkel next doen
    });
};


exports.updatePost = (req, res, next) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect");
    error.statusCode = 422;
    throw error; // when thrwoing error, exit the function execution
  }

  const postId = req.params.postId; // get postId uit URL met params ipv body
  const title = req.body.title;
  const content = req.body.content;
  const imageUrl= req.body.imageUrl;

  Post.findById(postId)
    .then(post =>{
      if(!post){
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; 
      }

      if(req.userId !== post.creator.toString()){
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error; 
      }
      post.title = title;
      post.imageUrl = imageUrl;
      post.content = content;
      return post.save();
    })
    .then( result =>{
      res.status(200).json({
        message:'post updated', post:result
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};




exports.deletePost = (req, res, next) => {

  const postId = req.params.postId; // get postId uit URL met params ipv body

  Post.findById(postId)
    .then(post =>{
      if(!post){
        const error = new Error("Could not find post");
        error.statusCode = 404;
        throw error; 
      }

      if(req.userId !== post.creator.toString()){
        const error = new Error("Not authorized");
        error.statusCode = 403;
        throw error; 
      }
      return Post.findByIdAndRemove(postId);
    })
    .then( result =>{
      return User.findById(req.userId);
     
    })
    .then(user =>{
      user.posts.pull(postId);
      return user.save();
     
    })
    .then( result=>{
      res.status(200).json({
        message:'post deleted'
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
