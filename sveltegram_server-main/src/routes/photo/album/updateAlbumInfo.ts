module.exports = async (req, res, next) => {
    
    
    const album = await this._getAlbum({ authUser, albumId });

    if (authUser.id != album.ownerId) {
      throw new BadRequestException('Unauthorized to change album info');
    }

    const updatedAlbum = await this._albumRepository.updateAlbum(album, updateAlbumDto);
    return mapAlbum(updatedAlbum);

  

  const updateAlbum(album, updateAlbumDto) {
    album.albumName = updateAlbumDto.albumName || album.albumName;
    album.albumThumbnailAssetId = updateAlbumDto.albumThumbnailAssetId || album.albumThumbnailAssetId;

    return this.albumRepository.save(album);
  }


};


  