

import User from "../../models/user";
const redis = require("../../services/redis/redis");
  const emitStatus = require("../../services/socketController/emitUserStatus");
  const { getCustomStatusByUserId, changeStatusByUserId } = require("../../services/redis/newRedisWrapper");
  
  module.exports = async (req, res, next) => {
    const io = req.io;
    const { status } = req.body;
    const beforeStatus = req.user.status;
  
  
    await User.updateOne({ _id: req.user._id },
      { $set: { "status": status } })
    // change the status in redis.
    await changeStatusByUserId(req.user.id, status);

    // emit status to users.
    if (beforeStatus === 0) {
      const [customStatus] = await getCustomStatusByUserId(req.user.id)
      emitStatus(req.user.id, req.user._id, status, io, false, customStatus?.[1], true)
  
    } else {
      emitStatus(req.user.id, req.user._id, status, io);
    }
    res.json({
      status: true,
      set: status
    });
  };
  