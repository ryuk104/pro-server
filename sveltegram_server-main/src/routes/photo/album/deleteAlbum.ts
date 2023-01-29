import album from '../../../models/photo/album';
import User from '../../../models/user';






module.exports = async (req, res, next) => {

  const { albumId } = req.params;

  album.findOne(albumId)
  if (!albumId) {
    return res
    .status(404)
    .json({ message: "Invalid ID" });
  } else {
    album.deleteOne(albumId);
    res.json("deleted")

  }


   //await album.updateOne({ channelId: channel_id, creator: req.user._id }, {hide: true});
  //const album = await this._getAlbum({ authUser, albumId }); 

};

    
