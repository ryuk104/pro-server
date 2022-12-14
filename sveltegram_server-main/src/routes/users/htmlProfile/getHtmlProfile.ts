import { NextFunction, Request, Response } from "express-serve-static-core";

import User from "../../../models/user";

export const getHtmlProfile = async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({_id: req.user._id}).select("htmlProfile")
  if (!user) return res.status(404).json("User not found")
  if (!user.htmlProfile) return res.status(404).json("Html profile does not exist.")
  res.status(200).json(user.htmlProfile)
};
