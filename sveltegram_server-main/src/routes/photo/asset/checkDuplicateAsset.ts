async checkDuplicatedAsset(
    authUser: AuthUserDto,
    checkDuplicateAssetDto: CheckDuplicateAssetDto,
  ): Promise<CheckDuplicateAssetResponseDto> {
    const res = await this.assetRepository.findOne({
      where: {
        deviceAssetId: checkDuplicateAssetDto.deviceAssetId,
        deviceId: checkDuplicateAssetDto.deviceId,
        userId: authUser.id,
      },
    });

    const isDuplicated = res ? true : false;

    return new CheckDuplicateAssetResponseDto(isDuplicated, res?.id);
  }