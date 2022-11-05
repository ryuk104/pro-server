import { NextFunction, Request, Response } from "express-serve-static-core";

import User from "../../../models/user";

export const deleteHtmlProfile = async (req: Request, res: Response, next: NextFunction) => {
  await User.updateOne({_id: req.user._id}, {$unset: {htmlProfile: 1}})
  res.status(200).json({status: "done"})
};
