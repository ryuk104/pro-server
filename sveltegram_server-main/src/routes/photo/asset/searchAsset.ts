async searchAsset(authUser: AuthUserDto, searchAssetDto: SearchAssetDto): Promise<AssetResponseDto[]> {
    const query = `
    SELECT a.*
    FROM assets a
             LEFT JOIN smart_info si ON a.id = si."assetId"
             LEFT JOIN exif e ON a.id = e."assetId"

    WHERE a."userId" = $1
       AND
       (
         TO_TSVECTOR('english', ARRAY_TO_STRING(si.tags, ',')) @@ PLAINTO_TSQUERY('english', $2) OR
         TO_TSVECTOR('english', ARRAY_TO_STRING(si.objects, ',')) @@ PLAINTO_TSQUERY('english', $2) OR
         e."exifTextSearchableColumn" @@ PLAINTO_TSQUERY('english', $2)
        );
    `;

    const searchResults: AssetEntity[] = await this.assetRepository.query(query, [
      authUser.id,
      searchAssetDto.searchTerm,
    ]);

    return searchResults.map((asset) => mapAsset(asset));
  }
