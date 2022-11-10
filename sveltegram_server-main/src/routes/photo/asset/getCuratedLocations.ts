async getCuratedLocation(authUser: AuthUserDto): Promise<CuratedLocationsResponseDto[]> {
    return this._assetRepository.getLocationsByUserId(authUser.id);
  }

  async getAssetWithNoSmartInfo(): Promise<AssetEntity[]> {
    return await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.smartInfo', 'si')
      .where('asset.resizePath IS NOT NULL')
      .andWhere('si.id IS NULL')
      .getMany();
  }

  async getAssetWithNoEXIF(): Promise<AssetEntity[]> {
    return await this.assetRepository
      .createQueryBuilder('asset')
      .leftJoinAndSelect('asset.exifInfo', 'ei')
      .where('ei."assetId" IS NULL')
      .getMany();
  }

  async getLocationsByUserId(userId: string): Promise<CuratedLocationsResponseDto[]> {
    return await this.assetRepository.query(
      `
        SELECT DISTINCT ON (e.city) a.id, e.city, a."resizePath", a."deviceAssetId", a."deviceId"
        FROM assets a
        LEFT JOIN exif e ON a.id = e."assetId"
        WHERE a."userId" = $1
        AND e.city IS NOT NULL
        AND a.type = 'IMAGE';
      `,
      [userId],
    );
  }
