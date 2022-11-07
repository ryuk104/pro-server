import User from "../../models/user";

module.exports = async (req, res, next) => {
  const user_id = req.params.user_id;

  const user = await User.findOne({id: user_id}).select("ip");
  if (!user) {
    return res.status(403).json({ message: "User not found." });
  }
  if (!user.ip) {
    return res.json([]);
  }


  const users = await User.find({ip: user.ip}).select('-_id avatar email id ip username tag created banned bot banner').sort({_id: -1}).limit(30).lean()
  res.json(users)
  
};