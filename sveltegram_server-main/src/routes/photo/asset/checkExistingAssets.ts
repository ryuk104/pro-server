module.exports = async (req, res, next) => {

  class CheckExistingAssets {
    deviceAssetIds!: string[];
  
    deviceId!: string;
  }
  
  const checkExistingAssets(checkExistingAssetsDto) {
    return asset._assetRepository.getExistingAssets(authUser.id, checkExistingAssetsDto);
  }



};








