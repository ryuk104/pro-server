/**
   * Get all shared album, including owned and shared one.
   * @param authUser AuthUserDto
   * @returns All Shared Album And Its Members
   */
 async getAllAlbums(authUser: AuthUserDto, getAlbumsDto: GetAlbumsDto): Promise<AlbumResponseDto[]> {
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
