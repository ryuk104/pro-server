public async getUserAssetsByDeviceId(authUser: AuthUserDto, deviceId: string) {
    return this._assetRepository.getAllByDeviceId(authUser.id, deviceId);
  }

  it('get assets by device id', async () => {
    const assets = _getAssets();

    assetRepositoryMock.getAllByDeviceId.mockImplementation(() =>
      Promise.resolve<string[]>(Array.from(assets.map((asset) => asset.deviceAssetId))),
    );

    const deviceId = 'device_id_1';
    const result = await sui.getUserAssetsByDeviceId(authUser, deviceId);

    expect(result.length).toEqual(2);
    expect(result).toEqual(assets.map((asset) => asset.deviceAssetId));
  });


  private async findAssetOfDevice(deviceId: string, assetId: string): Promise<AssetResponseDto> {
    const rows = await this.assetRepository.query(
      'SELECT * FROM assets a WHERE a."deviceAssetId" = $1 AND a."deviceId" = $2',
      [assetId, deviceId],
    );

    if (rows.lengh == 0) {
      throw new NotFoundException('Not Found');
    }

    const assetOnDevice = rows[0] as AssetEntity;

    return mapAsset(assetOnDevice);
  }

  public async getAssetById(authUser: AuthUserDto, assetId: string): Promise<AssetResponseDto> {
    const asset = await this._assetRepository.getById(assetId);

    return mapAsset(asset);
  }


  public async serveFile(authUser: AuthUserDto, query: ServeFileDto, res: Res, headers: any) {
    let fileReadStream: ReadStream;
    const asset = await this.findAssetOfDevice(query.did, query.aid);

    if (!asset) {
      throw new NotFoundException('Asset does not exist');
    }

    // Handle Sending Images
    if (asset.type == AssetType.IMAGE) {
      try {
        /**
         * Serve file viewer on the web
         */
        if (query.isWeb) {
          res.set({
            'Content-Type': 'image/jpeg',
          });
          if (!asset.resizePath) {
            Logger.error('Error serving IMAGE asset for web', 'ServeFile');
            throw new InternalServerErrorException(`Failed to serve image asset for web`, 'ServeFile');
          }
          await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.resizePath);

          return new StreamableFile(fileReadStream);
        }

        /**
         * Serve thumbnail image for both web and mobile app
         */
        if (!query.isThumb) {
          res.set({
            'Content-Type': asset.mimeType,
          });

          await fs.access(asset.originalPath, constants.R_OK | constants.W_OK);
          fileReadStream = createReadStream(asset.originalPath);
        } else {
          if (asset.webpPath && asset.webpPath.length > 0) {
            res.set({
              'Content-Type': 'image/webp',
            });

            await fs.access(asset.webpPath, constants.R_OK | constants.W_OK);
            fileReadStream = createReadStream(asset.webpPath);
          } else {
            res.set({
              'Content-Type': 'image/jpeg',
            });

            if (!asset.resizePath) {
              throw new Error('resizePath not set');
            }

            await fs.access(asset.resizePath, constants.R_OK | constants.W_OK);
            fileReadStream = createReadStream(asset.resizePath);
          }
        }

        return new StreamableFile(fileReadStream);
      } catch (e) {
        Logger.error(`Cannot create read stream for asset ${asset.id} ${JSON.stringify(e)}`, 'serveFile[IMAGE]');
        throw new InternalServerErrorException(
          e,
          `Cannot read thumbnail file for asset ${asset.id} - contact your administrator`,
        );
      }
    } else {
      try {
        // Handle Video
        let videoPath = asset.originalPath;

        let mimeType = asset.mimeType;

        await fs.access(videoPath, constants.R_OK | constants.W_OK);

        if (query.isWeb && asset.mimeType == 'video/quicktime') {
          videoPath = asset.encodedVideoPath == '' ? String(asset.originalPath) : String(asset.encodedVideoPath);
          mimeType = asset.encodedVideoPath == '' ? asset.mimeType : 'video/mp4';
        }

        const { size } = await fileInfo(videoPath);
        const range = headers.range;

        if (range) {
          /** Extracting Start and End value from Range Header */
          let [start, end] = range.replace(/bytes=/, '').split('-');
          start = parseInt(start, 10);
          end = end ? parseInt(end, 10) : size - 1;

          if (!isNaN(start) && isNaN(end)) {
            start = start;
            end = size - 1;
          }
          if (isNaN(start) && !isNaN(end)) {
            start = size - end;
            end = size - 1;
          }

          // Handle unavailable range request
          if (start >= size || end >= size) {
            console.error('Bad Request');
            // Return the 416 Range Not Satisfiable.
            res.status(416).set({
              'Content-Range': `bytes */${size}`,
            });

            throw new BadRequestException('Bad Request Range');
          }

          /** Sending Partial Content With HTTP Code 206 */
          res.status(206).set({
            'Content-Range': `bytes ${start}-${end}/${size}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': end - start + 1,
            'Content-Type': mimeType,
          });

          const videoStream = createReadStream(videoPath, { start: start, end: end });

          return new StreamableFile(videoStream);
        } else {
          res.set({
            'Content-Type': mimeType,
          });

          return new StreamableFile(createReadStream(videoPath));
        }
      } catch (e) {
        Logger.error(`Error serving VIDEO asset id ${asset.id}`, 'serveFile[VIDEO]');
        throw new InternalServerErrorException(`Failed to serve video asset ${e}`, 'ServeFile');
      }
    }
  }  