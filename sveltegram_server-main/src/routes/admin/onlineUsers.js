import { User } from "../../models/user";
const { getConnectedUserIds } = require("../../services/redis/newRedisWrapper");
const redis = require('../../services/redis/redis');



//import * as UserCache from '../../cache/User.cache';

module.exports = async (req, res, next) => {

  
  const [userIds, error] = await getConnectedUserIds();

  if (error || !userIds) {
    return res.status(403).json({message: 'Something went wrong. (Redis failed.)'})
  }
  const onlineIds = userIds.map(i => i.split(':')[1]);
  const users = await User.find({id:{ $in: onlineIds}}, {_id: 0}).select('avatar id username tag created status ip email bot').sort({_id: -1}).limit(30).lean()
  res.json(users);
};



/*
module.exports = async (req, res, next) => {
  const userIds = await UserCache.getConnectedUserIds();
  const users = await Users.find({id:{ $in: userIds}}).select('-_id avatar id username tag created status ip email bot').sort({_id: -1}).limit(30).lean()
  res.json(users);
};

*/