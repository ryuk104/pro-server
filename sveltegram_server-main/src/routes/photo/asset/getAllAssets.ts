public async getAllAssets(authUser: AuthUserDto): Promise<AssetResponseDto[]> {
    const assets = await this._assetRepository.getAllByUserId(authUser.id);

    return assets.map((asset) => mapAsset(asset));
  }