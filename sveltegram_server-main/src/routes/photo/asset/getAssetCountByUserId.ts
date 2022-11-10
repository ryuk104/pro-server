it('get asset count by user id', async () => {
    const assetCount = _getAssetCountByUserId();

    assetRepositoryMock.getAssetCountByUserId.mockImplementation(() =>
      Promise.resolve<AssetCountByUserIdResponseDto>(assetCount),
    );

    const result = await sui.getAssetCountByUserId(authUser);

    expect(result).toEqual(assetCount);
  });

  const _getAssetCountByUserId = (): AssetCountByUserIdResponseDto => {
    const result = new AssetCountByUserIdResponseDto(2, 2);

    return result;
  };

  getAssetByChecksum(userId: string, checksum: Buffer) {
    return this._assetRepository.getAssetByChecksum(userId, checksum);
  }

  calculateChecksum(filePath: string): Promise<Buffer> {
    const fileReadStream = createReadStream(filePath);
    const sha1Hash = createHash('sha1');
    const deferred = new Promise<Buffer>((resolve, reject) => {
      sha1Hash.once('error', (err) => reject(err));
      sha1Hash.once('finish', () => resolve(sha1Hash.read()));
    });

    fileReadStream.pipe(sha1Hash);
    return deferred;
  }

  getAssetCountByUserId(authUser: AuthUserDto): Promise<AssetCountByUserIdResponseDto> {
    return this._assetRepository.getAssetCountByUserId(authUser.id);
  }
}

async getAssetCountByUserId(userId: string): Promise<AssetCountByUserIdResponseDto> {
  // Get asset count by AssetType
  const res = await this.assetRepository
    .createQueryBuilder('asset')
    .select(`COUNT(asset.id)`, 'count')
    .addSelect(`asset.type`, 'type')
    .where('"userId" = :userId', { userId: userId })
    .groupBy('asset.type')
    .getRawMany();

  const assetCountByUserId = new AssetCountByUserIdResponseDto(0, 0);
  res.map((item) => {
    if (item.type === 'IMAGE') {
      assetCountByUserId.photos = item.count;
    } else if (item.type === 'VIDEO') {
      assetCountByUserId.videos = item.count;
    }
  });

  return assetCountByUserId;
}