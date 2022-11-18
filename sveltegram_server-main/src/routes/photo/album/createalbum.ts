import album from '../../../models/photo/album';
import User from '../../../models/user';


  
module.exports = async (req, res, next) => {

/*
const create = (AlbumEntity) {
*/
      // Create album entity

      let newAlbum = await album.create({
          ...req.body,
          /*
          ownerId: req.ownerId,
          albumName: req.albumName,
          creator: req.User,
          */
        });


      //try {

        
        /*
        const currentUser = res.locals.user;
    
        const newPost = new Post({
          ...req.body,
          user: currentUser._id,
        });
    
        const saveAlbum = await album.save();
    
        const post = await Post.findById(savePost._id)
          .populate("user", "name profilePic")
    
        return res.status(201).json({
          type: "success",
          message: " post created successfully",
          data: {
            post,
          },
        });
      } catch (error) {
        return next(error);
      }
      */
      /*
      // Add shared users
      if (newAlbum.sharedWithUserIds?.length) {
        for (const sharedUserId of createAlbumDto.sharedWithUserIds) {
          const newSharedUser = new UserAlbumEntity();
          newSharedUser.albumId = album.id;
          newSharedUser.sharedUserId = sharedUserId;

          await transactionalEntityManager.save(newSharedUser);
        }
      }

      // Add shared assets
      const newRecords: AssetAlbumEntity[] = [];

      if (createAlbumDto.assetIds?.length) {
        for (const assetId of createAlbumDto.assetIds) {
          const newAssetAlbum = new AssetAlbumEntity();
          newAssetAlbum.assetId = assetId;
          newAssetAlbum.albumId = album.id;

          newRecords.push(newAssetAlbum);
        }
      }

      if (!album.albumThumbnailAssetId && newRecords.length > 0) {
        album.albumThumbnailAssetId = newRecords[0].assetId;
        await transactionalEntityManager.save(album);
      }

      await transactionalEntityManager.save([...newRecords]);
    */
      return newAlbum;

  }

//};