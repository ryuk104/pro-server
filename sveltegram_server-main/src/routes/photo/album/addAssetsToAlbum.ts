import album from '../../../models/photo/album';
import User from '../../../models/user';




module.exports = async (req, res, next) => {
  const addAssetsToAlbum(
    authUser,
    albumId: string,
  );

  const newRecords: AssetAlbumEntity[] = [];
  const alreadyExisting: string[] = [];
  const album = await album.getAlbum({albumId, validateIsOwner: false });
  const result = await album.get.albumRepository.addAssets(album, addAssetsDto);
  const newAlbum = await album.getAlbum({albumId, validateIsOwner: false });

  

  let addAssetsToAlbum = await album.create({
    authUser: req.ownerId,
    addAssets: req.albumName,
    albumId: req.user._id,
  });



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

  // Add album thumbnail if not exist.
  if (!album.albumThumbnailAssetId && newRecords.length > 0) {
    album.albumThumbnailAssetId = newRecords[0].assetId;
    await album.albumRepository.save(album);
  }

  await album.assetAlbumRepository.save([...newRecords]);

  return {
    successfullyAdded: newRecords.length,
    alreadyInAlbum: alreadyExisting
  };
  

};



