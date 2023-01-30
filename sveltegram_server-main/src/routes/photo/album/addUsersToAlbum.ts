import album from "../../../models/photo/album"
import User from "../../../models/user"


module.exports = async (req, res, next) => {

  const { albumId } = req.params;
  const { user }  = req.body;

  album.findById(albumId)
  //album.sharedUsers.save(user)

  //res.json({album})


  let adduser = await album.create({          
    sharedUsers: user,
    });


        res.status(200).json({
          type: "success",
          message: "post deleted successfully",
          data: null,
        });
    

}

