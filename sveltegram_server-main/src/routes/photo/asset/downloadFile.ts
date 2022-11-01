public async downloadFile(query: ServeFileDto, res: Res) {
    try {
      let fileReadStream = null;
      const asset = await this.findAssetOfDevice(query.did, query.aid);

      // Download Video
      if (asset.type === AssetType.VIDEO) {
        const { size } = await fileInfo(asset.originalPath);

        res.set({
          'Content-Type': asset.mimeType,
          'Content-Length': size,
        });

        await fs.access(asset.originalPath, constants.R_OK | constants.W_OK);
        fileReadStream = createReadStream(asset.originalPath);
      } else {
        // Download Image
        if (!query.isThumb) {
          /**
           * Download Image Original File
           */
          const { size } = await fileInfo(asset.originalPath);

          res.set({
            'Content-Type': asset.mimeType,
            'Content-Length': size,
          });

          await fs.access(asset.originalPath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.originalPath);
        } else {
          /**
           * Download Image Resize File
           */
          if (!asset.resizePath) {
            throw new NotFoundException('resizePath not set');
          }

          const { size } = await fileInfo(asset.resizePath);

          res.set({
            'Content-Type': 'image/jpeg',
            'Content-Length': size,
          });

          await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.resizePath);
        }
      }

      return new StreamableFile(fileReadStream);
    } catch (e) {
      Logger.error(`Error download asset ${e}`, 'downloadFile');
      throw new InternalServerErrorException(`Failed to download asset ${e}`, 'DownloadFile');
    }
  }
