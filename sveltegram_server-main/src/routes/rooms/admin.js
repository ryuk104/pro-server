const express = require('express');
const {isAdmin, addAdmin, removeAdmin, identityIsAdmin} = require('./auth');

const router = express.Router({mergeParams: true});

const verifyAdmin = async (req, res, next) => {
  if (await isAdmin(req)) {
    next();
    return;
  }
  res.sendStatus(403);
};

import {post, deleteRequest} from './backend';

/*
export const addAdmin = async (state, id) => {
  return await post(state, `/admin/${id}`, {});
};


export const removeAdmin = async (state, id) => {
  return await deleteRequest(state, `/admin/${id}`, {});
};

*/

module.exports = router;
