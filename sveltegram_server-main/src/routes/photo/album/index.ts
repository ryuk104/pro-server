import express from "express";
const router = express.Router();
import { authenticate, checkAuth } from "../../../middlewares/authenticate";



//import { AlbumService } from './album.service';


// TODO might be worth creating a AlbumParamsDto that validates `albumId` instead of using the pipe.
/*
  router.get('/count-by-user-id',
  require("./getAlbumCountByUserId"),
  //getAlbumCountByUserId,
  //AlbumCountResponseDto,
  //return this.albumService.getAlbumCountByUserId(authUser);
  );
  */

  router.post('/', 
  checkAuth,
  require("./createAlbum"),
  );
  
  router.put('/:albumId/users', 
  require("./addUsersToAlbum"),
  );

  
  

  router.put('/:albumId/assets',
  require("./addAssetsToAlbum"),
  );


  router.get('/getAllAlbums',
    require("./getAllAlbums"),
  );

  router.get('/:albumId',
  require("./getAlbumInfo"),
  );

  
//needs work
  router.delete('/:albumId/assets',
  require("./removeAssetFromAlbum"),
  );

  

  router.delete('/:albumId',
  require("./deleteAlbum"),
  );

  
//needs work
  router.delete('/:albumId/user/:userId',
  require("./removeUserFromAlbum"),
  );

  //needs work
  router.patch('/:albumId',
  require("./updateAlbumInfo"),
  );


  router.get('/:albumId/download',
  require("./downloadArchive"),
  );
  
export default router;
