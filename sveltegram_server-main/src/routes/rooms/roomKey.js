const express = require('express');
const {isModerator, hasAccessToRoom} = require('./auth');
const {set, get} = require('../../services/rediss');

const router = express.Router({mergeParams: true});

module.exports = async (req, res, next) => {
  const verifyModerator = async (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      res.sendStatus(401);
      return;
    }

    if (!(await isModerator(req, req.params.id))) {
      res.sendStatus(403);
      return;
    }

    next();
};

  const verifyRoomKeyAccess = async (req, res, next) => {
    if (await isModerator(req, req.params.id)) {
      next();
      return;
    }

    if (await hasAccessToRoom(req, req.params.id)) {
      next();
      return;
  }

  res.sendStatus(403);
};
}


