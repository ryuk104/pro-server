async getCuratedObject(authUser: AuthUserDto): Promise<CuratedObjectsResponseDto[]> {
    return this._assetRepository.getDetectedObjectsByUserId(authUser.id);
  }

  async getDetectedObjectsByUserId(userId: string): Promise<CuratedObjectsResponseDto[]> {
    return await this.assetRepository.query(
      `
        SELECT DISTINCT ON (unnest(si.objects)) a.id, unnest(si.objects) as "object", a."resizePath", a."deviceAssetId", a."deviceId"
        FROM assets a
        LEFT JOIN smart_info si ON a.id = si."assetId"
        WHERE a."userId" = $1
        AND si.objects IS NOT NULL
      `,
      [userId],
    );
  }
