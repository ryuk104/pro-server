import album from '../../../models/photo/album';
import User from '../../../models/user';



module.exports = async (req, res, next) => {
  const { albumId } = req.params;
  const { userId } = req.params;

  const userToBeKicked = await User.findOne({ _id: userId });

  const albums = await album.find({ _id: albumId });
 // const channelIDs = channels.map(channel => channel.channelId)


 await User.deleteMany({
  sharedUsers: userToBeKicked._id,
  album: albums._id
});
/*
await album.updateOne({ _id: albumId }, {
  $pull: {
    sharedUsers: [{_id: req.params.userId}],
  },
});
*/

/*
await album.findByIdAndUpdate( albumId,
  { $pull: { "sharedUsers.$._id": userId } },
);
*/






/*
album.updateOne({ _id: albumId }, {
  $pullAll: {
    sharedUsers: req.params.userId,
  },
});
*/
res.json("deleted")



/*
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
*/
};





  