import { Router } from "express";
const { authenticate } = require("../../middlewares/authenticate");


const router = Router();

import GetCategories from './getCategories'
import getSearches from './getSearches'

// Get Categories
router.get("/categories",
  authenticate(),
  GetCategories
);

// Get search
router.get("/search/:value",
  authenticate(),
  getSearches
);





export default router;