import { AlbumEntity } from '@app/database/entities/album.entity';
import { AssetAlbumEntity } from '@app/database/entities/asset-album.entity';
import { UserAlbumEntity } from '@app/database/entities/user-album.entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, DataSource } from 'typeorm';
import { AddAssets } from './add-assets';
import { AddUsers } from './/add-users';
import { CreateAlbum } from './/create-album';
import { GetAlbums } from './/get-albums';
import { RemoveAssets } from './/remove-assets';
import { UpdateAlbum } from './/update-album.';
import { AlbumCountResponse } from './album-count-response';

export interface IAlbumRepository {
  create(ownerId: string, createAlbum: CreateAlbum): Promise<AlbumEntity>;
  getList(ownerId: string, getAlbums: GetAlbums): Promise<AlbumEntity[]>;
  get(albumId: string): Promise<AlbumEntity | undefined>;
  delete(album: AlbumEntity): Promise<void>;
  addSharedUsers(album: AlbumEntity, addUsers: AddUsers): Promise<AlbumEntity>;
  removeUser(album: AlbumEntity, userId: string): Promise<void>;
  removeAssets(album: AlbumEntity, removeAssets: RemoveAssets): Promise<AlbumEntity>;
  addAssets(album: AlbumEntity, addAssets: AddAssets): Promise<AlbumEntity>;
  updateAlbum(album: AlbumEntity, updateAlbum: UpdateAlbum): Promise<AlbumEntity>;
  getListByAssetId(userId: string, assetId: string): Promise<AlbumEntity[]>;
  getCountByUserId(userId: string): Promise<AlbumCountResponse>;
}

export const ALBUM_REPOSITORY = 'ALBUM_REPOSITORY';

@Injectable()
export class AlbumRepository implements IAlbumRepository {
  constructor(
    @InjectRepository(AlbumEntity)
    private albumRepository: Repository<AlbumEntity>,

    @InjectRepository(AssetAlbumEntity)
    private assetAlbumRepository: Repository<AssetAlbumEntity>,

    @InjectRepository(UserAlbumEntity)
    private userAlbumRepository: Repository<UserAlbumEntity>,

    private dataSource: DataSource,
  ) {}

  async getCountByUserId(userId: string): Promise<AlbumCountResponse> {
    const ownedAlbums = await this.albumRepository.find({ where: { ownerId: userId }, relations: ['sharedUsers'] });

    const sharedAlbums = await this.userAlbumRepository.count({
      where: { sharedUserId: userId },
    });

    let sharedAlbumCount = 0;
    ownedAlbums.map((album) => {
      if (album.sharedUsers?.length) {
        sharedAlbumCount += 1;
      }
    });

    return new AlbumCountResponse(ownedAlbums.length, sharedAlbums, sharedAlbumCount);
  }

  async create(ownerId: string, createAlbum: CreateAlbum): Promise<AlbumEntity> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Create album entity
      const newAlbum = new AlbumEntity();
      newAlbum.ownerId = ownerId;
      newAlbum.albumName = createAlbum.albumName;

      const album = await transactionalEntityManager.save(newAlbum);

      // Add shared users
      if (createAlbum.sharedWithUserIds?.length) {
        for (const sharedUserId of createAlbum.sharedWithUserIds) {
          const newSharedUser = new UserAlbumEntity();
          newSharedUser.albumId = album.id;
          newSharedUser.sharedUserId = sharedUserId;

          await transactionalEntityManager.save(newSharedUser);
        }
      }

      // Add shared assets
      const newRecords: AssetAlbumEntity[] = [];

      if (createAlbum.assetIds?.length) {
        for (const assetId of createAlbum.assetIds) {
          const newAssetAlbum = new AssetAlbumEntity();
          newAssetAlbum.assetId = assetId;
          newAssetAlbum.albumId = album.id;

          newRecords.push(newAssetAlbum);
        }
      }

      if (!album.albumThumbnailAssetId && newRecords.length > 0) {
        album.albumThumbnailAssetId = newRecords[0].assetId;
        await transactionalEntityManager.save(album);
      }

      await transactionalEntityManager.save([...newRecords]);

      return album;
    });
  }

  async getList(ownerId: string, getAlbums: GetAlbums): Promise<AlbumEntity[]> {
    const filteringByShared = typeof getAlbums.shared == 'boolean';
    const userId = ownerId;
    let query = this.albumRepository.createQueryBuilder('album');

    const getSharedAlbumIdsSubQuery = (qb: SelectQueryBuilder<AlbumEntity>) => {
      return qb
        .subQuery()
        .select('albumSub.id')
        .from(AlbumEntity, 'albumSub')
        .innerJoin('albumSub.sharedUsers', 'userAlbumSub')
        .where('albumSub.ownerId = :ownerId', { ownerId: userId })
        .getQuery();
    };

    if (filteringByShared) {
      if (getAlbums.shared) {
        // shared albums
        query = query
          .innerJoinAndSelect('album.sharedUsers', 'sharedUser')
          .innerJoinAndSelect('sharedUser.userInfo', 'userInfo')
          .where((qb) => {
            // owned and shared with other users
            const subQuery = getSharedAlbumIdsSubQuery(qb);
            return `album.id IN ${subQuery}`;
          })
          .orWhere((qb) => {
            // shared with userId
            const subQuery = qb
              .subQuery()
              .select('userAlbum.albumId')
              .from(UserAlbumEntity, 'userAlbum')
              .where('userAlbum.sharedUserId = :sharedUserId', { sharedUserId: userId })
              .getQuery();
            return `album.id IN ${subQuery}`;
          });
      } else {
        // owned, not shared albums
        query = query.where('album.ownerId = :ownerId', { ownerId: userId }).andWhere((qb) => {
          const subQuery = getSharedAlbumIdsSubQuery(qb);
          return `album.id NOT IN ${subQuery}`;
        });
      }
    } else {
      // owned and shared with userId
      query = query
        .leftJoinAndSelect('album.sharedUsers', 'sharedUser')
        .leftJoinAndSelect('sharedUser.userInfo', 'userInfo')
        .where('album.ownerId = :ownerId', { ownerId: userId });
    }

    // Get information of assets in albums
    query = query
      .leftJoinAndSelect('album.assets', 'assets')
      .leftJoinAndSelect('assets.assetInfo', 'assetInfo')
      .orderBy('"assetInfo"."createdAt"::timestamptz', 'ASC');

    const albums = await query.getMany();

    albums.sort((a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf());

    return albums;
  }

  async getListByAssetId(userId: string, assetId: string): Promise<AlbumEntity[]> {
    const query = this.albumRepository.createQueryBuilder('album');

    const albums = await query
      .where('album.ownerId = :ownerId', { ownerId: userId })
      .andWhere((qb) => {
        // shared with userId
        const subQuery = qb
          .subQuery()
          .select('assetAlbum.albumId')
          .from(AssetAlbumEntity, 'assetAlbum')
          .where('assetAlbum.assetId = :assetId', { assetId: assetId })
          .getQuery();
        return `album.id IN ${subQuery}`;
      })
      .leftJoinAndSelect('album.assets', 'assets')
      .leftJoinAndSelect('assets.assetInfo', 'assetInfo')
      .leftJoinAndSelect('album.sharedUsers', 'sharedUser')
      .leftJoinAndSelect('sharedUser.userInfo', 'userInfo')
      .orderBy('"assetInfo"."createdAt"::timestamptz', 'ASC')
      .getMany();

    return albums;
  }

  async get(albumId: string): Promise<AlbumEntity | undefined> {
    const query = this.albumRepository.createQueryBuilder('album');

    const album = await query
      .where('album.id = :albumId', { albumId })
      .leftJoinAndSelect('album.sharedUsers', 'sharedUser')
      .leftJoinAndSelect('sharedUser.userInfo', 'userInfo')
      .leftJoinAndSelect('album.assets', 'assets')
      .leftJoinAndSelect('assets.assetInfo', 'assetInfo')
      .leftJoinAndSelect('assetInfo.exifInfo', 'exifInfo')
      .orderBy('"assetInfo"."createdAt"::timestamptz', 'ASC')
      .getOne();

    if (!album) {
      return;
    }

    return album;
  }

  async delete(album: AlbumEntity): Promise<void> {
    await this.albumRepository.delete({ id: album.id, ownerId: album.ownerId });
  }

  async addSharedUsers(album: AlbumEntity, addUsers: AddUsers): Promise<AlbumEntity> {
    const newRecords: UserAlbumEntity[] = [];

    for (const sharedUserId of addUsers.sharedUserIds) {
      const newEntity = new UserAlbumEntity();
      newEntity.albumId = album.id;
      newEntity.sharedUserId = sharedUserId;

      newRecords.push(newEntity);
    }

    await this.userAlbumRepository.save([...newRecords]);
    return this.get(album.id) as Promise<AlbumEntity>; // There is an album for sure
  }

  async removeUser(album: AlbumEntity, userId: string): Promise<void> {
    await this.userAlbumRepository.delete({ albumId: album.id, sharedUserId: userId });
  }

  async removeAssets(album: AlbumEntity, removeAssets: RemoveAssets): Promise<AlbumEntity> {
    let deleteAssetCount = 0;
    // TODO: should probably do a single delete query?
    for (const assetId of removeAssets.assetIds) {
      const res = await this.assetAlbumRepository.delete({ albumId: album.id, assetId: assetId });
      if (res.affected == 1) deleteAssetCount++;
    }

    // TODO: No need to return boolean if using a singe delete query
    if (deleteAssetCount == removeAssets.assetIds.length) {
      const retAlbum = (await this.get(album.id)) as AlbumEntity;

      if (retAlbum?.assets?.length === 0) {
        // is empty album
        await this.albumRepository.update(album.id, { albumThumbnailAssetId: null });
        retAlbum.albumThumbnailAssetId = null;
      }

      return retAlbum;
    } else {
      throw new BadRequestException('Some assets were not found in the album');
    }
  }

  async addAssets(album: AlbumEntity, addAssets: AddAssets): Promise<AlbumEntity> {
    const newRecords: AssetAlbumEntity[] = [];

    for (const assetId of addAssets.assetIds) {
      const newAssetAlbum = new AssetAlbumEntity();
      newAssetAlbum.assetId = assetId;
      newAssetAlbum.albumId = album.id;

      newRecords.push(newAssetAlbum);
    }

    // Add album thumbnail if not exist.
    if (!album.albumThumbnailAssetId && newRecords.length > 0) {
      album.albumThumbnailAssetId = newRecords[0].assetId;
      await this.albumRepository.save(album);
    }

    await this.assetAlbumRepository.save([...newRecords]);
    return this.get(album.id) as Promise<AlbumEntity>; // There is an album for sure
  }

  updateAlbum(album: AlbumEntity, updateAlbum: UpdateAlbum): Promise<AlbumEntity> {
    album.albumName = updateAlbum.albumName || album.albumName;
    album.albumThumbnailAssetId = updateAlbum.albumThumbnailAssetId || album.albumThumbnailAssetId;

    return this.albumRepository.save(album);
  }
}
