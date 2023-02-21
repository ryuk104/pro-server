import album from '../../../models/photo/album';
import asset from '../../../models/photo/asset';


module.exports = async (req, res, next) => {
  const { albumId } = req.params;
    const updateAlbum = await album.delete(asset);
    let deleteAssetCount = 0;


    // TODO: should probably do a single delete query?
    for (const assetId of asset.assetIds) {
      const res = await album.delete({ albumId: album.id, assetId: assetId });
      if (res.affected == 1) deleteAssetCount++;
    }

    // TODO: No need to return boolean if using a singe delete query
    if (deleteAssetCount == asset.assetIds.length) {
      const retAlbum = (await album.get(album.id)) as AlbumEntity;

      if (retAlbum?.assets?.length === 0) {
        // is empty album
        await album.update(album.id, { albumThumbnailAssetId: null });
        retAlbum.albumThumbnailAssetId = null;
      }

      return retAlbum;
    } else {
      console.log('Some assets were not found in the album');
    }


  };

  
