async addAssetsToAlbum(
    authUser: AuthUserDto,
    addAssetsDto: AddAssetsDto,
    albumId: string,
  ): Promise<AddAssetsResponseDto> {
    const album = await this._getAlbum({ authUser, albumId, validateIsOwner: false });
    const result = await this._albumRepository.addAssets(album, addAssetsDto);
    const newAlbum = await this._getAlbum({ authUser, albumId, validateIsOwner: false });

    return {
      ...result,
      album: mapAlbum(newAlbum),
    };
  }

  async addAssets(album: AlbumEntity, addAssetsDto: AddAssetsDto): Promise<AddAssetsResponseDto> {
    const newRecords: AssetAlbumEntity[] = [];
    const alreadyExisting: string[] = [];

    for (const assetId of addAssetsDto.assetIds) {
      // Album already contains that asset
      if (album.assets?.some(a => a.assetId === assetId)) {
        alreadyExisting.push(assetId);
        continue;
      }
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

    return {
      successfullyAdded: newRecords.length,
      alreadyInAlbum: alreadyExisting
    };
  }
