import themePolicy from '../../policies/ThemePolicies';


import { getTheme } from './getTheme';
import { deleteTheme } from './deleteTheme';
import { getThemes } from './getThemes';
import { saveTheme } from './saveTheme';
import { updateTheme } from './updateTheme';

// Middleware
import { authenticate } from "../../middlewares/authenticate";
import { Router } from 'express';


const router = Router();

// get theme
router.get("/:id",
  authenticate(),
  getTheme
);

// delete theme
router.delete("/:id",
  authenticate(),
  deleteTheme
);

// get themes
router.get("/",
  authenticate(),
  getThemes
);

// save theme
router.post("/",
  authenticate(),
  themePolicy.save,
  saveTheme
);

// update theme
router.patch("/:id",
  authenticate(),
  themePolicy.save,
  updateTheme
);




export default router;
