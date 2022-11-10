module.exports = async (req, res, next) => {
    async create(authUser: AuthUserDto, createAlbumDto: CreateAlbumDto): Promise<AlbumResponseDto> {
        const albumEntity = await this._albumRepository.create(authUser.id, createAlbumDto);
        return mapAlbum(albumEntity);
      }
};
  


async create(ownerId: string, createAlbumDto: CreateAlbumDto): Promise<AlbumEntity> {
    return this.dataSource.transaction(async (transactionalEntityManager) => {
      // Create album entity
      const newAlbum = new AlbumEntity();
      newAlbum.ownerId = ownerId;
      newAlbum.albumName = createAlbumDto.albumName;

      const album = await transactionalEntityManager.save(newAlbum);

      // Add shared users
      if (createAlbumDto.sharedWithUserIds?.length) {
        for (const sharedUserId of createAlbumDto.sharedWithUserIds) {
          const newSharedUser = new UserAlbumEntity();
          newSharedUser.albumId = album.id;
          newSharedUser.sharedUserId = sharedUserId;

          await transactionalEntityManager.save(newSharedUser);
        }
      }

      // Add shared assets
      const newRecords: AssetAlbumEntity[] = [];

      if (createAlbumDto.assetIds?.length) {
        for (const assetId of createAlbumDto.assetIds) {
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
