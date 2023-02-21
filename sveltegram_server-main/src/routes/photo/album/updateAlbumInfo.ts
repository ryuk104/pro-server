import album from '../../../models/photo/album';

module.exports = async (req, res, next) => {
    
    
  const { albumId } = req.params;

  album.findOne(albumId)
  if (!albumId) {
    return res
    .status(404)
    .json({ message: "Invalid ID" });
  } if (User.id != album.ownerId) {
    return res
    .status(404)
    .json({ message: "Unauthorized to change album info" });
  } else {
    let body = req.body
    album.update(body);
    res.json("updated")

  }


};


  