import album from "../../../models/photo/album"
import User from "../../../models/user"


module.exports = async (req, res, next) => {

  const { albumId } = req.params;
  const { users }  = req.body;

  //let users = {req.user._id: user}

  await album.findOneAndUpdate(
    {_id: req.params.albumId},
        /*update: {
      $setOnInsert: {sharedUsers: users}
    },*/
    {
      $push: { sharedUsers: users },
    },
    { new: true }
    //upsert: true 
  );
  //album.deleteOne(albumId);
  
  

  

  /*
  let albums = album.findById(albumId)


  await albums.updateMany({upsert: true},{          
    sharedUsers: user,
    });

    //await album.save();
*/

    res.status(200).json({
      type: "success",
      message: "post deleted successfully",
      data: null,
    });
    

}

