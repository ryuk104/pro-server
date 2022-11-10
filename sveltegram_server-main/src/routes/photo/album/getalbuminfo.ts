async getAlbumInfo(authUser: AuthUserDto, albumId: string): Promise<AlbumResponseDto> {
    const album = await this._getAlbum({ authUser, albumId, validateIsOwner: false });
    return mapAlbum(album);
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


  async getCountByUserId(userId: string): Promise<AlbumCountResponseDto> {
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

    return new AlbumCountResponseDto(ownedAlbums.length, sharedAlbums, sharedAlbumCount);
  }