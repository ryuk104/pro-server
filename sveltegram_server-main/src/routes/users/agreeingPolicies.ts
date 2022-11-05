import User from "../../models/user";

module.exports = async (req, res, next) => {
  req.session.destroy();
  await User.updateOne({id: req.user.id}, {$set: {readTerms: true}});
  res.json({success: true})
  

}