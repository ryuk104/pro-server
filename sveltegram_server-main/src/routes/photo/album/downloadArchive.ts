import album from '../../../models/photo/album';
import archiver from "archiver";




module.exports = async (req, res, next) => {

  const { albumId } = req.params;

  album.findById(albumId)
    .populate("albumId","_id name")
    .then(album =>{
      const archive = archiver('zip', { store: true });
      res.attachment(`${album.albumName}.zip`);
      archive.pipe(res);
      album.assets?.forEach((a) => {
        const name = `${a.assetInfo.exifInfo?.imageName || a.assetInfo.id}.${a.assetInfo.originalPath.split('.')[1]}`;
        archive.file(a.assetInfo.originalPath, { name });
      });
      return archive.finalize();
      //res.json({album})
    })
    .catch(err=>{
      console.log(`Error downloading album ${err}`, 'downloadArchive');
      console.log(err)
    })

   

  
    
  }; 