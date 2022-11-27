const express = require("express");
const router = express.Router();

// Middleware
//used authenticate in future
const { authenticate } = require("../../../middlewares/authenticate");

// Policies
const relationshipPolicy = require("../../../policies/relationshipPolicies");


// Add
router.post('/', authenticate() , relationshipPolicy.post, require('./addFriend'));

// Accept
//router.put('/', checkAuth, relationshipPolicy.put, require('./acceptFriend'));


// Remove
//router.delete('/', checkAuth, relationshipPolicy.delete, require('./removeFriend'));


export default router;
module.exports = router;

