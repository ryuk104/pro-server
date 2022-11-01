import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { AuthUserDto } from '../../decorators/auth-user.decorator';
import { CreateAlbumDto } from './dto/create-album.dto';
import { AlbumEntity } from '@app/database/entities/album.entity';
import { AddUsersDto } from './dto/add-users.dto';
import { RemoveAssetsDto } from './dto/remove-assets.dto';
import { UpdateAlbumDto } from './dto/update-album.dto';
import { GetAlbumsDto } from './dto/get-albums.dto';
import { AlbumResponseDto, mapAlbum, mapAlbumExcludeAssetInfo } from './response-dto/album-response.dto';
import { ALBUM_REPOSITORY, IAlbumRepository } from './album-repository';
import { AlbumCountResponseDto } from './response-dto/album-count-response.dto';
import { ASSET_REPOSITORY, IAssetRepository } from '../asset/asset-repository';
import { AddAssetsResponseDto } from './response-dto/add-assets-response.dto';
import { AddAssetsDto } from './dto/add-assets.dto';
import { Response as Res } from 'express';
import archiver from 'archiver';

@Injectable()
export class AlbumService {
  constructor(
    @Inject(ALBUM_REPOSITORY) private _albumRepository: IAlbumRepository,
    @Inject(ASSET_REPOSITORY) private _assetRepository: IAssetRepository,
  ) {}

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

  async create(authUser: AuthUserDto, createAlbumDto: CreateAlbumDto): Promise<AlbumResponseDto> {
    const albumEntity = await this._albumRepository.create(authUser.id, createAlbumDto);
    return mapAlbum(albumEntity);
  }

  async _checkValidThumbnail(album: AlbumEntity): Promise<AlbumEntity> {
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
