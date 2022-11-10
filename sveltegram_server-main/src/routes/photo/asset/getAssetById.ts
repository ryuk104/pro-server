async getAllByUserId(userId: string): Promise<AssetEntity[]> {
    const query = this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.userId = :userId', { userId: userId })
      .andWhere('asset.resizePath is not NULL')
      .leftJoinAndSelect('asset.exifInfo', 'exifInfo')
      .orderBy('asset.createdAt', 'DESC');

    return await query.getMany();
  }

  async getAllByDeviceId(userId: string, deviceId: string): Promise<string[]> {
    const rows = await this.assetRepository.find({
      where: {
        userId: userId,
        deviceId: deviceId,
      },
      select: ['deviceAssetId'],
    });
    const res: string[] = [];
    rows.forEach((v) => res.push(v.deviceAssetId));

    return res;
  }

  async getById(assetId: string): Promise<AssetEntity> {
    return await this.assetRepository.findOneOrFail({
      where: {
        id: assetId,
      },
      relations: ['exifInfo'],
    });
  }
