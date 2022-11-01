async addUsersToAlbum(authUser: AuthUserDto, addUsersDto: AddUsersDto, albumId: string): Promise<AlbumResponseDto> {
    const album = await this._getAlbum({ authUser, albumId });
    const updatedAlbum = await this._albumRepository.addSharedUsers(album, addUsersDto);
    return mapAlbum(updatedAlbum);
  }