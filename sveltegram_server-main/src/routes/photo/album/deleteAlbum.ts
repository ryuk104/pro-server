import album from '../../../models/photo/album';
import User from '../../../models/user';






module.exports = async (req, res, next) => {

  const ({ id: album.id, ownerId: album.ownerId })

  let album = await albums
    .findOne({ album.id: ownerId})
  if (!album) {
    return res
    .status(404)
    .json({ message: "Invalid ID" });
  }


   await album.updateOne({ channelId: channel_id, creator: req.user._id }, {hide: true});





  const album = await this._getAlbum({ authUser, albumId });
  await album.delete(album);


};

    
