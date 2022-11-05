import User from "../../../models/user";
import {Friends} from '../../../models/Friends';
import { RELATIONSHIP_DELETED } from "../../../ServerEventNames";

module.exports = async (req, res, next) => {
  const recipientUserID = req.body.id; 

  // check if the recipient exists
  const recipient = await User.findOne({id: recipientUserID});
  if (!recipient) return res.status(403)
    .json({ status: false, errors: [{param: "all", msg: "Users not found."}] });

  // check if the decliner exists
  const decliner = await User.findOne({id: req.user.id})
  if (!decliner) return res.status(403)
    .json({ status: false, errors: [{param: "all", msg: "Something went wrong."}] });
  
  // check if the request exists
  const request = await Friends.findOne({ requester: decliner, recipient: recipient });
  if (!request) return res.status(403)
    .json({ status: false, errors: [{param: "all", msg: "Request doesnt exist."}] });
 
  // remove from database
  const docA = await Friends.findOneAndRemove({ requester: decliner, recipient: recipient });
  const docB = await Friends.findOneAndRemove({ requester: recipient, recipient: decliner });

  const updateUserA = await User.findOneAndUpdate({ _id: decliner },{ $pull: { friends: docA._id }});
  const updateUserB = await User.findOneAndUpdate({ _id: recipient },{ $pull: { friends: docB._id }});

  const io = req.io
  io.in(decliner.id).emit(RELATIONSHIP_DELETED, recipient.id);

  io.in(recipient.id).emit(RELATIONSHIP_DELETED, decliner.id);

  return res.json({ status: true, message: `Request deleted` })
}