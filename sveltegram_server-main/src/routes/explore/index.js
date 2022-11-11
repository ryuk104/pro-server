const MainExploreRouter = require("express").Router();
// Middleware
const { authenticate } = require("../../../middlewares/authenticate");




// servers
MainExploreRouter.use('/servers', require('./servers'));

// themes
MainExploreRouter.use('/themes', require('./themes'));




// get public servers list
MainServersRouter.route('/').get(
  authenticate(),
  require("./getPublicServersList")
);

// get a server
MainServersRouter.route('/:server_id').get(
  authenticate(),
  require("./getServer")
);

// update  public server
MainServersRouter.route('/:server_id').patch(
  authenticate(),
  require("./updatePublicServersList")
);

// delete  public server
MainServersRouter.route('/:server_id').delete(
  authenticate(),
  require("./deletePublicServersList")
);

// add to public servers list
MainServersRouter.route('/').post(
  authenticate(),
  require("../addPublicServersList")
);





module.exports = MainExploreRouter;
