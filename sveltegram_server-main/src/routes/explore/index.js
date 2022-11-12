const MainExploreRouter = require("express").Router();
// Middleware
const { authenticate } = require("../../middlewares/authenticate");




// servers
MainExploreRouter.use('/servers', require('./servers'));

// themes
MainExploreRouter.use('/themes', require('./themes'));




// get public servers list
router.get('/',
  authenticate(),
  require("./getPublicServersList")
);

// get a server
router.get('/:server_id',
  authenticate(),
  require("./getServer")
);

// update  public server
router.patch('/:server_id',
  authenticate(),
  require("./updatePublicServersList")
);

// delete  public server
router.delete('/:server_id',
  authenticate(),
  require("./deletePublicServersList")
);

// add to public servers list
router.post('/',
  authenticate(),
  require("../addPublicServersList")
);





module.exports = MainExploreRouter;
