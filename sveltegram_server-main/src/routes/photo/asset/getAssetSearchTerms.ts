async getAssetSearchTerm(authUser: AuthUserDto): Promise<string[]> {
    const possibleSearchTerm = new Set<string>();

    const rows = await this._assetRepository.getSearchPropertiesByUserId(authUser.id);
    rows.forEach((row: SearchPropertiesDto) => {
      // tags
      row.tags?.map((tag: string) => possibleSearchTerm.add(tag?.toLowerCase()));

      // objects
      row.objects?.map((object: string) => possibleSearchTerm.add(object?.toLowerCase()));

      // asset's tyoe
      possibleSearchTerm.add(row.assetType?.toLowerCase() || '');

      // image orientation
      possibleSearchTerm.add(row.orientation?.toLowerCase() || '');

      // Lens model
      possibleSearchTerm.add(row.lensModel?.toLowerCase() || '');

      // Make and model
      possibleSearchTerm.add(row.make?.toLowerCase() || '');
      possibleSearchTerm.add(row.model?.toLowerCase() || '');

      // Location
      possibleSearchTerm.add(row.city?.toLowerCase() || '');
      possibleSearchTerm.add(row.state?.toLowerCase() || '');
      possibleSearchTerm.add(row.country?.toLowerCase() || '');
    });

    return Array.from(possibleSearchTerm).filter((x) => x != null && x != '');
}

async getSearchPropertiesByUserId(userId: string): Promise<SearchPropertiesDto[]> {
  return await this.assetRepository
    .createQueryBuilder('asset')
    .where('asset.userId = :userId', { userId: userId })
    .leftJoin('asset.exifInfo', 'ei')
    .leftJoin('asset.smartInfo', 'si')
    .select('si.tags', 'tags')
    .addSelect('si.objects', 'objects')
    .addSelect('asset.type', 'assetType')
    .addSelect('ei.orientation', 'orientation')
    .addSelect('ei."lensModel"', 'lensModel')
    .addSelect('ei.make', 'make')
    .addSelect('ei.model', 'model')
    .addSelect('ei.city', 'city')
    .addSelect('ei.state', 'state')
    .addSelect('ei.country', 'country')
    .distinctOn(['si.tags'])
    .getRawMany();
}