module.exports = async (req, res, next) => {


  const CheckDuplicateAsset {
    deviceAssetId!: string;
    deviceId!: string;
  }
  
  const checkDuplicatedAsset(
    checkDuplicateAsset,
  ) {
    const res = await asset.assetRepository.findOne({
      where: {
        deviceAssetId: checkDuplicateAsset.deviceAssetId,
        deviceId: checkDuplicateAsset.deviceId,
        userId: authUser.id,
      },
    });

    const isDuplicated = res ? true : false;

    return new CheckDuplicateAssetResponseDto(isDuplicated, res?.id);
  }

};






