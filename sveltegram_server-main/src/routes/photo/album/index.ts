import express from "express";
const router = express.Router();
import { authenticate, checkAuth } from "../../../middlewares/authenticate";



//import { ParseMeUUIDPipe } from '../validation/parse-me-uuid-pipe';
//import { AlbumService } from './album.service';

//import { Authenticated } from '../../decorators/authenticated.decorator';
//import { AuthUserDto, GetAuthUser } from '../../decorators/auth-user.decorator';


// TODO might be worth creating a AlbumParamsDto that validates `albumId` instead of using the pipe.
//router.use(Authenticated)
//@ApiTags('Album')
//@Controller('album')
//AlbumController {
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
  //createAlbum,
  //createAlbumDto
  //return this.albumService.create(authUser, createAlbumDto);
  );
  
/*
  router.put('/:albumId/users', 
  require("./addUsersToAlbum"),
  //addUsersToAlbum,
  //addUsersDto,
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //return this.albumService.addUsersToAlbum(authUser, addUsersDto, albumId);
  );

  */
  
/*
  router.put('/:albumId/assets',
  require("./addAssetsToAlbum"),
  //addAssetsToAlbum,
  //addAssetsDto,
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //) : Promise<AddAssetsResponseDto> {
  //  return this.albumService.addAssetsToAlbum(authUser, addAssetsDto, albumId);
  );
*/
  router.get(
    require("./getAllAlbums"),
    //getAllAlbums
    //@Query(new ({ transform: true })) query: GetAlbumsDto,
    //return this.albumService.getAllAlbums(authUser, query);
  );

  router.get('/:albumId',
  require("./getAlbumInfo"),
  //getAlbumInfo
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //return this.albumService.getAlbumInfo(authUser, albumId);
  );

  /*

  router.delete('/:albumId/assets',
  require("./removeAssetFromAlbum"),
  //removeAssetFromAlbum(
  //@Body() removeAssetsDto: RemoveAssetsDto,
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //): Promise<AlbumResponseDto> {
  //return this.albumService.removeAssetsFromAlbum(authUser, removeAssetsDto, albumId);
  );

  router.delete('/:albumId',
  require("./deleteAlbum"),
  //deleteAlbum(
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //return this.albumService.deleteAlbum(authUser, albumId);
  );

  router.delete('/:albumId/user/:userId',
  require("./removeUserFromAlbum"),
  //removeUserFromAlbum
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //@Param('userId', new ParseMeUUIDPipe({ version: '4' })) userId: string,
  //return this.albumService.removeUserFromAlbum(authUser, albumId, userId);
  );

  router.patch('/:albumId',
  require("./updateAlbumInfo"),
  //updateAlbumInfo
  //@Body() updateAlbumInfoDto: UpdateAlbumDto,
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //return this.albumService.updateAlbumInfo(authUser, updateAlbumInfoDto, albumId);
  );

  router.get('/:albumId/download',
  require("./downloadArchive"),
  //downloadArchive,
  //@Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  //@Response({ passthrough: true }) res: Res,
  //return this.albumService.downloadArchive(authUser, albumId, res);
  );
*/
  
export default router;
