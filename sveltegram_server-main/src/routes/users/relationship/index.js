import express from "express";
const router = express.Router();

// Middleware
const { authenticate } = require("../../../middlewares/authenticate");

// Policies
const relationshipPolicy = require("../../../policies/relationshipPolicies");


// Add
router.post('/', authenticate(), relationshipPolicy.post, require('./addFriend'));

// Accept
router.put('/', authenticate(), relationshipPolicy.put, require('./acceptFriend'));


// Remove
router.delete('/', authenticate(), relationshipPolicy.delete, require('./removeFriend'));


module.exports = router;
