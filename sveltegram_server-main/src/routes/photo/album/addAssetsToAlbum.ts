import album from '../../../models/photo/album';
import assets from '../../../models/photo/asset';
import User from '../../../models/user';




module.exports = async (req, res, next) => {
  const { albumId } = req.params;
  const { name } = req.body;



  const alreadyExisting: string[] = [];
  const albums = await album.findById(albumId);
  const newAlbum = await album.findById(albumId);

  

  let addAssetsToAlbum = await album.create({
    asset: req.asset,
  });


/*
  for (const assetId of album.assetIds) {
    // Album already contains that asset
    if (album.assets?.some(a => a.assetId === assetId)) {
      alreadyExisting.push(assetId);
      continue;
    }
    const newAssetAlbum = new AssetAlbumEntity();
    newAssetAlbum.assetId = assetId;
    newAssetAlbum.albumId = album.id;

    newRecords.push(newAssetAlbum);
  }
  */
/*
  // Add album thumbnail if not exist.
  if (!album.albumThumbnailAssetId && newRecords.length > 0) {
    album.albumThumbnailAssetId = newRecords[0].assetId;
    await album.albumRepository.save(album);
  }

  await album.assetAlbumRepository.save([...newRecords]);
*/
  return {
    //successfullyAdded: newRecords.length,
    alreadyInAlbum: alreadyExisting
  };
  

};



