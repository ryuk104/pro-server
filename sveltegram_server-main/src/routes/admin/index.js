import express from "express";
const router = express.Router();

/*
import approveTheme from "./approveTheme"
import {
  approveTheme,
  deleteServer,
  getTheme,
} from "../controllers/admin";
*/

// Middleware../middlewares/authenticate
import { authenticate, checkAuth } from "../../middlewares/authenticate";
import isAdmin from '../../middlewares/isAdmin';

// recently Created Accounts
//router.post("/register", registerValidation, registerUser);

router.get ("/users/recent",
  checkAuth,
  isAdmin,
  require("./recentUsers"));

router.get ("/users/search/:value",
  authenticate(),
  isAdmin,
  require("./searchUsers"));

router.get ("/users/ip/:user_id",
  authenticate(),
  isAdmin,
  require("./sameIPUsers"));

// suspend user
// for legacy nertivia (probably should remove after a while)
router.delete("/users/:id",
  authenticate(),
  isAdmin,
  require("./suspendUser"));

router.post("/users/:id/suspend",
  authenticate(),
  isAdmin,
  require("./suspendUser")
);

// remove Suspention
router.delete("/users/:id/suspend",
  authenticate(),
  isAdmin,
  require("./unsuspendUser")
);

router.get("/actions/recent",
  authenticate(),
  isAdmin,
  require("./recentAdminActions"));

router.get("/stats",
  authenticate(),
  isAdmin,
  require("./Stats"));

router.delete("/servers/:server_id",
  authenticate(),
  isAdmin,
  require("./deleteServer"));

// Online Users
router.get("/users/online",
  authenticate(),
  isAdmin,
  require("./onlineUsers"));


// recently Created Servers
router.get("/servers/recent",
  authenticate(),
  isAdmin,
  require("./recentServers"));

router.get("/servers/search/:value",
  authenticate(),
  isAdmin,
  require("./searchServers"));


// waiting for appeal themes
router.get("/themes/waiting",
  authenticate(),
  isAdmin,
  require("./waitingThemes"));

// get full theme information
router.get("/themes/:id",
  authenticate(),
  isAdmin,
  require("./getTheme"));

/*
// Approve theme
router.patch("/themes/:id/approve",
  authenticate(),
  isAdmin,
  require("./approveTheme"));
*/


export default router;