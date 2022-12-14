module.exports = async (req, res, next) => {
  

const removeUserFromAlbum(authUser | 'me') {
    const sharedUserId = userId == 'me' ? authUser.id : userId;
    const album = await album._getAlbum({ authUser, albumId, validateIsOwner: false });
    if (album.ownerId != authUser.id && authUser.id != sharedUserId) {
      throw new error('Cannot remove a user from a album that is not owned');
    }
    if (album.ownerId == sharedUserId) {
      throw new error('The owner of the album cannot be removed');
    }
    await album._albumRepository.removeUser(album, sharedUserId);
  }

const removeUser(album) {
    await album.user.delete({ albumId: album.id, sharedUserId: userId });
  }

};





  