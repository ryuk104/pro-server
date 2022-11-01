async checkExistingAssets(
    authUser: AuthUserDto,
    checkExistingAssetsDto: CheckExistingAssetsDto,
  ): Promise<CheckExistingAssetsResponseDto> {
    return this._assetRepository.getExistingAssets(authUser.id, checkExistingAssetsDto);
  }