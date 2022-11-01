public async getUserAssetsByDeviceId(authUser: AuthUserDto, deviceId: string) {
    return this._assetRepository.getAllByDeviceId(authUser.id, deviceId);
  }