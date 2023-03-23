import express from "express";
const router = express.Router();

import setup from "./setup"



router.use(setup);

/*
router.use(
  require("./setup")
);
*/