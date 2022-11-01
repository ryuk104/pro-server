async downloadArchive(authUser: AuthUserDto, albumId: string, res: Res) {
    try {
      const album = await this._getAlbum({ authUser, albumId, validateIsOwner: false });
      const archive = archiver('zip', { store: true });
      res.attachment(`${album.albumName}.zip`);
      archive.pipe(res);
      album.assets?.forEach((a) => {
        const name = `${a.assetInfo.exifInfo?.imageName || a.assetInfo.id}.${a.assetInfo.originalPath.split('.')[1]}`;
        archive.file(a.assetInfo.originalPath, { name });
      });
      return archive.finalize();
    } catch (e) {
      Logger.error(`Error downloading album ${e}`, 'downloadArchive');
      throw new InternalServerErrorException(`Failed to download album ${e}`, 'DownloadArchive');
    }
  }