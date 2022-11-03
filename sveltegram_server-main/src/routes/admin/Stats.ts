import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import {Servers} from "../../models/Servers";
import {Messages} from '../../models/Messages'

module.exports = async (_req: Request, res: Response, _next: NextFunction) => {
  const userCount = await User.estimatedDocumentCount()
  const serverCount = await Servers.estimatedDocumentCount()
  const messageCount = await Messages.estimatedDocumentCount()
  res.json({userCount, serverCount, messageCount});
};
