async getAssetCountByTimeBucket(
    authUser: AuthUserDto,
    getAssetCountByTimeBucketDto: GetAssetCountByTimeBucketDto,
  ): Promise<AssetCountByTimeBucketResponseDto> {
    const result = await this._assetRepository.getAssetCountByTimeBucket(
      authUser.id,
      getAssetCountByTimeBucketDto.timeGroup,
    );

    return mapAssetCountByTimeBucket(result);
  }