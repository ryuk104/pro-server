import { Router } from "express";
const { checkAuth } = require("../../middlewares/authenticate");


const router = Router();

import GetCategories from './getCategories'
import getSearches from './getSearches'

// Get Categories
router.get("/categories",
  checkAuth,
  GetCategories
);

// Get search
router.get("/search/:value",
  checkAuth,
  getSearches
);





export default router;