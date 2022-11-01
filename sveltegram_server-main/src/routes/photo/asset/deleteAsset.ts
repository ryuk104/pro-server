public async deleteAssetById(authUser: AuthUserDto, assetIds: DeleteAssetDto): Promise<DeleteAssetResponseDto[]> {
    const result: DeleteAssetResponseDto[] = [];

    const target = assetIds.ids;
    for (const assetId of target) {
      const res = await this.assetRepository.delete({
        id: assetId,
        userId: authUser.id,
      });

      if (res.affected) {
        result.push({
          id: assetId,
          status: DeleteAssetStatusEnum.SUCCESS,
        });
      } else {
        result.push({
          id: assetId,
          status: DeleteAssetStatusEnum.FAILED,
        });
      }
    }

    return result;
  }