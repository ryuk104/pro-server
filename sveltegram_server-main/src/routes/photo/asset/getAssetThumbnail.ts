public async getAssetThumbnail(assetId: string, query: GetAssetThumbnailDto, res: Res) {
    let fileReadStream: ReadStream;

    const asset = await this.assetRepository.findOne({ where: { id: assetId } });

    if (!asset) {
      throw new NotFoundException('Asset not found');
    }

    try {
      if (query.format == GetAssetThumbnailFormatEnum.JPEG) {
        if (!asset.resizePath) {
          throw new NotFoundException('resizePath not set');
        }

        await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
        fileReadStream = createReadStream(asset.resizePath);
      } else {
        if (asset.webpPath && asset.webpPath.length > 0) {
          await fs.access(asset.webpPath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.webpPath);
        } else {
          if (!asset.resizePath) {
            throw new NotFoundException('resizePath not set');
          }

          await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.resizePath);
        }
      }

      res.header('Cache-Control', 'max-age=300');
      return new StreamableFile(fileReadStream);
    } catch (e) {
      res.header('Cache-Control', 'none');
      Logger.error(`Cannot create read stream for asset ${asset.id}`, 'getAssetThumbnail');
      throw new InternalServerErrorException(
        e,
        `Cannot read thumbnail file for asset ${asset.id} - contact your administrator`,
      );
    }
  }

  async getAssetWithNoThumbnail(): Promise<AssetEntity[]> {
    return await this.assetRepository
      .createQueryBuilder('asset')
      .where('asset.resizePath IS NULL')
      .orWhere('asset.resizePath = :resizePath', { resizePath: '' })
      .orWhere('asset.webpPath IS NULL')
      .orWhere('asset.webpPath = :webpPath', { webpPath: '' })
      .getMany();
  }
