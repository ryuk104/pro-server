import express from "express";
const router = express.Router();

// Middleware
const { authenticate } = require("../../middlewares/authenticate");


// register device
router.post("/",
  authenticate(),
  require("./registerDevice")
);





export default router;