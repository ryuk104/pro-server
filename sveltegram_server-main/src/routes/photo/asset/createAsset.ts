module.exports = async (req, res, next) => {

  const create(
    ownerId: string,
    originalPath: string,
    mimeType: string,
    checksum?: Buffer,
  ) {
    const asset = new AssetEntity();
    asset.deviceAssetId = createAssetDto.deviceAssetId;
    asset.userId = ownerId;
    asset.deviceId = createAssetDto.deviceId;
    asset.type = createAssetDto.assetType || AssetType.OTHER;
    asset.originalPath = originalPath;
    asset.createdAt = createAssetDto.createdAt;
    asset.modifiedAt = createAssetDto.modifiedAt;
    asset.isFavorite = createAssetDto.isFavorite;
    asset.mimeType = mimeType;
    asset.duration = createAssetDto.duration || null;
    asset.checksum = checksum || null;

    const createdAsset = await this.assetRepository.save(asset);

    if (!createdAsset) {
      throw new BadRequestException('Asset not created');
    }
    return createdAsset;
  }



};

















// Currently failing due to calculate checksum from a file
it('create an asset', async () => {
    const assetEntity = _getAsset_1();

    assetRepositoryMock.create.mockImplementation(() => Promise.resolve<AssetEntity>(assetEntity));

    const originalPath = 'fake_path/asset_1.jpeg';
    const mimeType = 'image/jpeg';
    const createAssetDto = _getCreateAssetDto();
    const result = await sui.createUserAsset(
      authUser,
      createAssetDto,
      originalPath,
      mimeType,
      Buffer.from('0x5041E6328F7DF8AFF650BEDAED9251897D9A6241', 'hex'),
    );

    expect(result.userId).toEqual(authUser.id);
    expect(result.resizePath).toEqual('');
    expect(result.webpPath).toEqual('');
  });


  public async createUserAsset(
    authUser: AuthUserDto,
    createAssetDto: CreateAssetDto,
    originalPath: string,
    mimeType: string,
    checksum: Buffer,
  ): Promise<AssetEntity> {
    // Check valid time.
    const createdAt = createAssetDto.createdAt;
    const modifiedAt = createAssetDto.modifiedAt;

    if (!timeUtils.checkValidTimestamp(createdAt)) {
      createAssetDto.createdAt = await timeUtils.getTimestampFromExif(originalPath);
    }

    if (!timeUtils.checkValidTimestamp(modifiedAt)) {
      createAssetDto.modifiedAt = await timeUtils.getTimestampFromExif(originalPath);
    }

    const assetEntity = await this._assetRepository.create(
      createAssetDto,
      authUser.id,
      originalPath,
      mimeType,
      checksum,
    );

    return assetEntity;
  }

  