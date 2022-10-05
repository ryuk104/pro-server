import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNotEmpty} from 'class-validator';
import express from "express";
const router = express.Router();

export class GetAlbumsDto {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value == 'true') {
      return true;
    } else if (value == 'false') {
      return false;
    }
    return value;
  })
  /**
   * true: only shared albums
   * false: only non-shared own albums
   * undefined: shared and owned albums
   */
  shared?: boolean;

  /**
   * Only returns albums that contain the asset
   * Ignores the shared parameter
   * undefined: get all albums
   */
  assetId?: string;
}

export class AlbumService {
  

  private async _getAlbum({
    authUser,
    albumId,
    validateIsOwner = true,
  }: {
    authUser: AuthUserDto;
    albumId: string;
    validateIsOwner?: boolean;
  }): Promise<AlbumEntity> {
    const album = await this._albumRepository.get(albumId);
    if (!album) {
      throw new NotFoundException('Album Not Found');
    }
    const isOwner = album.ownerId == authUser.id;

    if (validateIsOwner && !isOwner) {
      throw new ForbiddenException('Unauthorized Album Access');
    } else if (!isOwner && !album.sharedUsers?.some((user) => user.sharedUserId == authUser.id)) {
      throw new ForbiddenException('Unauthorized Album Access');
    }
    return album;
  }




async function create(authUser: AuthUserDto, createAlbum: CreateAlbumDto): Promise<AlbumResponseDto> {
  const albumEntity = await this._albumRepository.create(authUser.id, createAlbumDto);
  return mapAlbum(albumEntity);
}

export class AlbumCountResponse {
  @ApiProperty({ type: 'integer' })
  owned!: number;

  @ApiProperty({ type: 'integer' })
  shared!: number;

  @ApiProperty({ type: 'integer' })
  sharing!: number;

  constructor(owned: number, shared: number, sharing: number) {
    this.owned = owned;
    this.shared = shared;
    this.sharing = sharing;
  }
}

/**
   * Get all shared album, including owned and shared one.
   * @param authUser AuthUserDto
   * @returns All Shared Album And Its Members
   */
 async function getAllAlbums(authUser: AuthUserDto, getAlbumsDto: GetAlbumsDto): Promise<AlbumResponseDto[]> {
  if (typeof getAlbumsDto.assetId === 'string') {
    const albums = await this._albumRepository.getListByAssetId(authUser.id, getAlbumsDto.assetId);
    return albums.map(mapAlbumExcludeAssetInfo);
  }
  const albums = await this._albumRepository.getList(authUser.id, getAlbumsDto);

  for (const album of albums) {
    await this._checkValidThumbnail(album);
  }

  return albums.map((album) => mapAlbumExcludeAssetInfo(album));
}

async function getAlbumInfo(authUser: AuthUserDto, albumId: string): Promise<AlbumResponseDto> {
  const album = await this._getAlbum({ authUser, albumId, validateIsOwner: false });
  return mapAlbum(album);
}

async function addUsersToAlbum(authUser: AuthUserDto, addUsersDto: AddUsersDto, albumId: string): Promise<AlbumResponseDto> {
  const album = await this._getAlbum({ authUser, albumId });
  const updatedAlbum = await this._albumRepository.addSharedUsers(album, addUsersDto);
  return mapAlbum(updatedAlbum);
}  

  

  async function deleteAlbum(authUser: AuthUserDto, albumId: string): Promise<void> {
    const album = await this._getAlbum({ authUser, albumId });
    await this._albumRepository.delete(album);
  }

  async function removeUserFromAlbum(authUser: AuthUserDto, albumId: string, userId: string | 'me'): Promise<void> {
    const sharedUserId = userId == 'me' ? authUser.id : userId;
    const album = await this._getAlbum({ authUser, albumId, validateIsOwner: false });
    if (album.ownerId != authUser.id && authUser.id != sharedUserId) {
      throw new ForbiddenException('Cannot remove a user from a album that is not owned');
    }
    if (album.ownerId == sharedUserId) {
      throw new BadRequestException('The owner of the album cannot be removed');
    }
    await this._albumRepository.removeUser(album, sharedUserId);
  }

  async function removeAssetsFromAlbum(
    authUser: AuthUserDto,
    removeAssetsDto: RemoveAssetsDto,
    albumId: string,
  ): Promise<AlbumResponseDto> {
    const album = await this._getAlbum({ authUser, albumId });
    const updateAlbum = await this._albumRepository.removeAssets(album, removeAssetsDto);
    return mapAlbum(updateAlbum);
  }

  
  async function updateAlbumInfo(
    authUser: AuthUserDto,
    updateAlbumDto: UpdateAlbumDto,
    albumId: string,
  ): Promise<AlbumResponseDto> {
    const album = await this._getAlbum({ authUser, albumId });

    if (authUser.id != album.ownerId) {
      throw new BadRequestException('Unauthorized to change album info');
    }

    const updatedAlbum = await this._albumRepository.updateAlbum(album, updateAlbumDto);
    return mapAlbum(updatedAlbum);
  }

  async function getAlbumCountByUserId(authUser: AuthUserDto): Promise<AlbumCountResponseDto> {
    return this._albumRepository.getCountByUserId(authUser.id);
  }

  async function _checkValidThumbnail(album: AlbumEntity): Promise<AlbumEntity> {
    const assetId = album.albumThumbnailAssetId;
    if (assetId) {
      try {
        await this._assetRepository.getById(assetId);
      } catch (e) {
        album.albumThumbnailAssetId = null;
        return await this._albumRepository.updateAlbum(album, {});
      }
    }

    return album;
  }
}


