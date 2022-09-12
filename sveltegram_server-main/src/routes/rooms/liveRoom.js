const express = require('express');
const {get} = require('../../services/rediss');
const {activeUsersInRoom} = require('../../services/ws');

const router = express.Router({mergeParams: true});



module.exports = router;
