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