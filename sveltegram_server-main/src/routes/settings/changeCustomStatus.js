const redis = require("../../services/redis/redis");
import { User } from "../../models/user";
import { SELF_CUSTOM_STATUS_CHANGE } from "../../ServerEventNames";
const emitAll = require("../../services/socketController/emitToAll");
const { changeCustomStatusByUserId } = require("../../services/redis/newRedisWrapper");

module.exports = async (req, res, next) => {
  const io = req.io;
  const { custom_status } = req.body;

  let customStatus = custom_status && custom_status.trim() !== "" ? custom_status : null;

  if (customStatus) {
    if (customStatus.length >= 100) {
      return res.status(401).json("String too long.")
    }
    customStatus = customStatus.replace(/\n/g, " ")
  }

  const obj = {};
  if (!customStatus) {
    obj.$unset = {
      custom_status: 1
    }
  } else {
    obj.$set =  {
      custom_status: customStatus
    }
  }
  await User.updateOne({_id: req.user._id}, obj)

  // change the status in redis.
  await changeCustomStatusByUserId(req.user.id, customStatus);

  // emit status to user.
  emitAll("member:custom_status_change", req.user._id, {user_id: req.user.id, custom_status: customStatus}, io)

  io.in(req.user.id).emit(SELF_CUSTOM_STATUS_CHANGE, { custom_status: customStatus});
    

  res.json({
    custom_status: customStatus
  });
};
