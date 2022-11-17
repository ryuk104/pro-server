module.exports = async (req, res, next) => {

  let newChannel = await Channels.create({
    sharedUserIds!: string[];

  });



  const addUsersToAlbum (addUsersDto, albumId: string) {
    const album = await this._getAlbum({ authUser, albumId });
    const updatedAlbum = await this._albumRepository.addSharedUsers(album, addUsersDto);
    return mapAlbum(updatedAlbum);
  }

  const addSharedUsers (album: AlbumEntity, addUsersDto: AddUsersDto) {
    const newRecords: UserAlbumEntity[] = [];

    for (const sharedUserId of addUsersDto.sharedUserIds) {
      const newEntity = new UserAlbumEntity();
      newEntity.albumId = album.id;
      newEntity.sharedUserId = sharedUserId;

      newRecords.push(newEntity);
    }

    await this.userAlbumRepository.save([...newRecords]);
    return this.get(album.id); // There is an album for sure
  }

}

