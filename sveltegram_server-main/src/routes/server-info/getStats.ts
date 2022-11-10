async getStats(): Promise<ServerStatsResponseDto> {
    const res = await this.assetRepository
      .createQueryBuilder('asset')
      .select(`COUNT(asset.id)`, 'count')
      .addSelect(`asset.type`, 'type')
      .addSelect(`asset.userId`, 'userId')
      .groupBy('asset.type, asset.userId')
      .addGroupBy('asset.type')
      .getRawMany();

    const serverStats = new ServerStatsResponseDto();
    const tmpMap = new Map<string, UsageByUserDto>();
    const getUsageByUser = (id: string) => tmpMap.get(id) || new UsageByUserDto(id);
    res.map((item) => {
      const usage: UsageByUserDto = getUsageByUser(item.userId);
      if (item.type === 'IMAGE') {
        usage.photos = parseInt(item.count);
        serverStats.photos += usage.photos;
      } else if (item.type === 'VIDEO') {
        usage.videos = parseInt(item.count);
        serverStats.videos += usage.videos;
      }
      tmpMap.set(item.userId, usage);
    });

    for (const userId of tmpMap.keys()) {
      const usage = getUsageByUser(userId);
      const userDiskUsage = await ServerInfoService.getDirectoryStats(path.join(APP_UPLOAD_LOCATION, userId));
      usage.usageRaw = userDiskUsage.size;
      usage.objects = userDiskUsage.fileCount;
      usage.usage = ServerInfoService.getHumanReadableString(usage.usageRaw);
      serverStats.usageRaw += usage.usageRaw;
      serverStats.objects += usage.objects;
    }
    serverStats.usage = ServerInfoService.getHumanReadableString(serverStats.usageRaw);
    serverStats.usageByUser = Array.from(tmpMap.values());
    return serverStats;
  }


  private static async getDirectoryStats(dirPath: string) {
    let size = 0;
    let fileCount = 0;
    for (const filename of readdirSync(dirPath)) {
      const absFilename = path.join(dirPath, filename);
      const fileStat = statSync(absFilename);
      if (fileStat.isFile()) {
        size += fileStat.size;
        fileCount += 1;
      } else if (fileStat.isDirectory()) {
        const subDirStat = await ServerInfoService.getDirectoryStats(absFilename);
        size += subDirStat.size;
        fileCount += subDirStat.fileCount;
      }
    }
    return { size, fileCount };
  }