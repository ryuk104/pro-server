import jwt from "jsonwebtoken";
//import { JWT_DECODE_ERR } from "../errors";

export const createJwtToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
  return token;
};

export const verifyJwtToken = (token, next) => {
  try {
    console.log("TDOASD")

    const { userId } = jwt.verify(token, process.env.JWT_SECRET);
    return userId;
  } catch (err) {
    next(err);
  }
};
