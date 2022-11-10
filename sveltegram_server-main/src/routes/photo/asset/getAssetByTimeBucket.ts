public async getAssetByTimeBucket(
    authUser: AuthUserDto,
    getAssetByTimeBucketDto: GetAssetByTimeBucketDto,
  ): Promise<AssetResponseDto[]> {
    const assets = await this._assetRepository.getAssetByTimeBucket(authUser.id, getAssetByTimeBucketDto);

    return assets.map((asset) => mapAsset(asset));
  }

  async getAssetCountByTimeBucket(userId: string, timeBucket: TimeGroupEnum) {
    let result: AssetCountByTimeBucket[] = [];

    if (timeBucket === TimeGroupEnum.Month) {
      result = await this.assetRepository
        .createQueryBuilder('asset')
        .select(`COUNT(asset.id)::int`, 'count')
        .addSelect(`date_trunc('month', "createdAt")`, 'timeBucket')
        .where('"userId" = :userId', { userId: userId })
        .andWhere('asset.resizePath is not NULL')
        .groupBy(`date_trunc('month', "createdAt")`)
        .orderBy(`date_trunc('month', "createdAt")`, 'DESC')
        .getRawMany();
    } else if (timeBucket === TimeGroupEnum.Day) {
      result = await this.assetRepository
        .createQueryBuilder('asset')
        .select(`COUNT(asset.id)::int`, 'count')
        .addSelect(`date_trunc('day', "createdAt")`, 'timeBucket')
        .where('"userId" = :userId', { userId: userId })
        .andWhere('asset.resizePath is not NULL')
        .groupBy(`date_trunc('day', "createdAt")`)
        .orderBy(`date_trunc('day', "createdAt")`, 'DESC')
        .getRawMany();
    }

    return result;
  }

  const _getAssetCountByTimeBucket = (): AssetCountByTimeBucket[] => {
    const result1 = new AssetCountByTimeBucket();
    result1.count = 2;
    result1.timeBucket = '2022-06-01T00:00:00.000Z';

    const result2 = new AssetCountByTimeBucket();
    result1.count = 5;
    result1.timeBucket = '2022-07-01T00:00:00.000Z';

    return [result1, result2];
  };

  async getAssetByTimeBucket(userId: string, getAssetByTimeBucketDto: GetAssetByTimeBucketDto): Promise<AssetEntity[]> {
    // Get asset entity from a list of time buckets
    return await this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.userId = :userId', { userId: userId })
      .andWhere(`date_trunc('month', "createdAt") IN (:...buckets)`, {
        buckets: [...getAssetByTimeBucketDto.timeBucket],
      })
      .andWhere('asset.resizePath is not NULL')
      .orderBy('asset.createdAt', 'DESC')
      .getMany();
  }