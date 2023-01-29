public async getAllAssets(authUser: AuthUserDto): Promise<AssetResponseDto[]> {
    const assets = await this._assetRepository.getAllByUserId(authUser.id);

    return assets.map((asset) => mapAsset(asset));
  }

  getAssetByChecksum(userId: string, checksum: Buffer): Promise<AssetEntity> {
    return this.assetRepository.findOneOrFail({
      where: {
        userId,
        checksum,
      },
      relations: ['exifInfo'],
    });
  }

  async getExistingAssets(
    userId: string,
    checkDuplicateAssetDto: CheckExistingAssetsDto,
  ): Promise<CheckExistingAssetsResponseDto> {
    const existingAssets = await this.assetRepository.find({
      select: { deviceAssetId: true },
      where: {
        deviceAssetId: In(checkDuplicateAssetDto.deviceAssetIds),
        deviceId: checkDuplicateAssetDto.deviceId,
        userId,
      },
    });
    return new CheckExistingAssetsResponseDto(existingAssets.map((a) => a.deviceAssetId));
  }


  //real

  photosController.getPhotos = async (request,response) =>{
    try {
        const photos = await Photo.find({})
        return response.status(200).json(photos)
    } catch (error) {
        console.log(error)
        return response.status(500).json({error})
    }
}

photosController.getPhoto = async (request,response) =>{
    const {id} = request.params
    try {
        const photo = await Photo.findById(id)
        console.log(photo)
        return response.status(200).json(photo)
    } catch (error) {
        console.log(error)
        return response.status(400).json({error:'Bad request'})
    }
}