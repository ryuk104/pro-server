async getCuratedLocation(authUser: AuthUserDto): Promise<CuratedLocationsResponseDto[]> {
    return this._assetRepository.getLocationsByUserId(authUser.id);
  }