const router = require("express").Router();

// Middleware
const { authenticate } = require("../../middlewares/authenticate");

// Policies
const settingsPolicy = require("../../policies/settingsPolicies");
const rateLimit = require("../../middlewares/rateLimit");

// Change Status
router.post("/status",
  authenticate(true),
  rateLimit({name: 'messages_load', expire: 60, requestsLimit: 50 }),
  settingsPolicy.status,
  require("./changeStatus")
);

// Change Custom Status
router.post("/custom-status",
  authenticate(true),
  rateLimit({name: 'messages_load', expire: 60, requestsLimit: 50 }),
  require("./changeCustomStatus")
);

// Change appearance
router.put("/apperance",
  //TODO: fix typo in database and client and server.
  authenticate(),
  require("./changeAppearance")
);

// Emoji
router.route("/emoji")
  .post(authenticate(), require("./addCustomEmoji"))
  .put(authenticate(), require("./renameCustomEmoji"))
  .delete(authenticate(), require("./deleteCustomEmoji"));

// Server Position
router.route("/server_position")
  .put(authenticate(), require("./serverPosition"))




module.exports = router;
