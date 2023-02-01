import album from '../../../models/photo/album';



module.exports = async (req, res, next) => {

  album.find({
    ownerId: req.user._id
  })
    .then(album =>{
        res.json({album})
    })
    .catch(err=>{
        console.log(err)
    })

  /*
  if (req.album) {
    res.json({
      userId: req.user.id,
      albumId: req.album.id,
      validateIsOwner: true,
    });
  } else {
    res.json({
      recipients: req.channel.recipients,
      channelId: req.channel.channelId,
    });
  }
*/


/*
    const album = await album.get(albumId);
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









  const getAllAlbums() {
    if (typeof album.assetId === 'string') {
      const albums = await this._albumRepository.getListByAssetId(User.id, getAlbumsDto.assetId);
      return albums.map(mapAlbumExcludeAssetInfo);
    }
    const albums = await this._albumRepository.getList(User.id, getAlbumsDto);

    for (const album of albums) {
      await this._checkValidThumbnail(album);
    }

    return albums.map((album) => mapAlbumExcludeAssetInfo(album));
  }
*/
















/**
   * Get all shared album, including owned and shared one.
   * @param authUser AuthUserDto
   * @returns All Shared Album And Its Members
   */
 

  

/*

  async getList(ownerId: string, getAlbumsDto: GetAlbumsDto): Promise<AlbumEntity[]> {
    const filteringByShared = typeof getAlbumsDto.shared == 'boolean';
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
      if (getAlbumsDto.shared) {
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
    */
  }