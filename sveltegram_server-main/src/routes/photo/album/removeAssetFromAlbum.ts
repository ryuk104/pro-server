async removeAssetsFromAlbum(
    authUser: AuthUserDto,
    removeAssetsDto: RemoveAssetsDto,
    albumId: string,
  ): Promise<AlbumResponseDto> {
    const album = await this._getAlbum({ authUser, albumId });
    const updateAlbum = await this._albumRepository.removeAssets(album, removeAssetsDto);
    return mapAlbum(updateAlbum);
  }