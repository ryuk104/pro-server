module.exports = async (req, res, next) => {
    
    authUser: AuthUserDto,
    removeAssetsDto: RemoveAssetsDto,
    albumId: string,
   Promise<AlbumResponseDto> 
    const album = await this._getAlbum({ authUser, albumId });
    const updateAlbum = await this._albumRepository.removeAssets(album, removeAssetsDto);
    return mapAlbum(updateAlbum);
  };

  async removeAssets(album: AlbumEntity, removeAssetsDto: RemoveAssetsDto): Promise<AlbumEntity> {
    let deleteAssetCount = 0;
    // TODO: should probably do a single delete query?
    for (const assetId of removeAssetsDto.assetIds) {
      const res = await this.assetAlbumRepository.delete({ albumId: album.id, assetId: assetId });
      if (res.affected == 1) deleteAssetCount++;
    }

    // TODO: No need to return boolean if using a singe delete query
    if (deleteAssetCount == removeAssetsDto.assetIds.length) {
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
