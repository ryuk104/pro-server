public async getAssetByTimeBucket(
    authUser: AuthUserDto,
    getAssetByTimeBucketDto: GetAssetByTimeBucketDto,
  ): Promise<AssetResponseDto[]> {
    const assets = await this._assetRepository.getAssetByTimeBucket(authUser.id, getAssetByTimeBucketDto);

    return assets.map((asset) => mapAsset(asset));
  }
