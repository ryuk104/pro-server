import album from "../../../models/photo/album"

module.exports = async (req, res, next) => {

  const { albumId } = req.params;

  album.findById(albumId)
  res.json({album})
    

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

