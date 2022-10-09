
const jwt = require('jsonwebtoken');
const env = require('dotenv').config();

let JSON_SECRET_KEY = "dsadsadsad"


const verifyJWT = token=>{
    return new Promise((resolve,reject)=>{
        jwt.verify(token,JSON_SECRET_KEY,(err,user)=>{
             if(err) return reject(err);
             if(user) return resolve(user);
        })
    })
}

module.exports=verifyJWT;