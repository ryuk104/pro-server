import express from "express";
const router = express.Router();

import { ParseMeUUIDPipe } from '../validation/parse-me-uuid-pipe';
import { AlbumService } from './album.service';
import { CreateAlbumDto } from './/create-album.';
import { JwtAuthGuard } from '../../modules/immich-jwt/guards/jwt-auth.guard';
import { AuthUser, GetAuthUser } from '../../decorators/auth-user.decorator';
import { AddAssets } from './add-assets';
import { AddUsers } from './/add-users';
import { RemoveAssets } from './/remove-assets';
import { UpdateAlbum } from './/update-album';
import { GetAlbums } from './/get-albums';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AlbumResponse } from './response-/album-response';
import { AlbumCountResponse } from './album-count-response';

// TODO might be worth creating a AlbumParamsDto that validates `albumId` instead of using the pipe.
router.use(UseGuards(JwtAuthGuard))
router.use(ApiBearerAuth())
router.use(ApiTags('Album'))
router.use(Controller('album'))

  //constructor(private readonly albumService: AlbumService) {}

  router.get('count-by-user-id') {
  async getAlbumCountByUserId(@GetAuthUser() authUser: AuthUserDto): Promise<AlbumCountResponseDto> {
    return this.albumService.getAlbumCountByUserId(authUser);
  }
}

  router.Post()
  async createAlbum(@GetAuthUser() authUser: AuthUserDto, @Body(ValidationPipe) createAlbumDto: CreateAlbumDto) {
    return this.albumService.create(authUser, createAlbumDto);
  }

  router.Put('/:albumId/users')
  async addUsersToAlbum(
    @GetAuthUser() authUser: AuthUserDto,
    @Body(ValidationPipe) addUsersDto: AddUsersDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ) {
    return this.albumService.addUsersToAlbum(authUser, addUsersDto, albumId);
  }

  router.Put('/:albumId/assets')
  async addAssetsToAlbum(
    @GetAuthUser() authUser: AuthUserDto,
    @Body(ValidationPipe) addAssetsDto: AddAssetsDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ) {
    return this.albumService.addAssetsToAlbum(authUser, addAssetsDto, albumId);
  }

  router.Get()
  async getAllAlbums(
    @GetAuthUser() authUser: AuthUserDto,
    @Query(new ValidationPipe({ transform: true })) query: GetAlbumsDto,
  ) {
    return this.albumService.getAllAlbums(authUser, query);
  }

  router.Get('/:albumId')
  async getAlbumInfo(
    @GetAuthUser() authUser: AuthUserDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ) {
    return this.albumService.getAlbumInfo(authUser, albumId);
  }

  router.Delete('/:albumId/assets')
  async removeAssetFromAlbum(
    @GetAuthUser() authUser: AuthUserDto,
    @Body(ValidationPipe) removeAssetsDto: RemoveAssetsDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ): Promise<AlbumResponseDto> {
    return this.albumService.removeAssetsFromAlbum(authUser, removeAssetsDto, albumId);
  }

  router.Delete('/:albumId')
  async deleteAlbum(
    @GetAuthUser() authUser: AuthUserDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ) {
    return this.albumService.deleteAlbum(authUser, albumId);
  }

  router.Delete('/:albumId/user/:userId')
  async removeUserFromAlbum(
    @GetAuthUser() authUser: AuthUserDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
    @Param('userId', new ParseMeUUIDPipe({ version: '4' })) userId: string,
  ) {
    return this.albumService.removeUserFromAlbum(authUser, albumId, userId);
  }

  router.Patch('/:albumId')
  async updateAlbumInfo(
    @GetAuthUser() authUser: AuthUserDto,
    @Body(ValidationPipe) updateAlbumInfoDto: UpdateAlbumDto,
    @Param('albumId', new ParseUUIDPipe({ version: '4' })) albumId: string,
  ) {
    return this.albumService.updateAlbumInfo(authUser, updateAlbumInfoDto, albumId);
  }

