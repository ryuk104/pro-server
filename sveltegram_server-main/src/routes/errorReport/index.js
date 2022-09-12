import express from "express";
const router = express.Router();

// Middleware
const rateLimit = require("../../middlewares/rateLimit");
const policy = require("../../policies/errorReportPolicies");


// report error
router.post("/",
  rateLimit({name: 'error_report', expire: 600, requestsLimit: 10, useIP: true}),
  policy.post,
  require("./reportError")
);





export default router;