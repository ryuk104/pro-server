import express from "express";
const router = express.Router();


//import { AssetService } from '../../../services/asset';
import { authenticate, checkAuth } from "../../../middlewares/authenticate";
import { CommunicationGateway } from '../communication';
import { Queue } from 'bull';

//router.use(Authenticated)
/*
    private wsCommunicateionGateway: CommunicationGateway,
    private assetService: AssetService,
    private backgroundTaskService: BackgroundTaskService,

    @InjectQueue(QueueNameEnum.ASSET_UPLOADED)
    private assetUploadedQueue: Queue<IAssetUploadedJob>,
  ) {}
*/
  /*
  router.post('upload')
  @UseInterceptors(FileInterceptor('assetData', assetUploadOption))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Asset Upload Information',
    type: AssetFileUploadDto,
  })
  */
/*,
uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body(ValidationPipe) assetInfo: CreateAssetDto,
  ): Promise<AssetFileUploadResponseDto> {
    const checksum = await this.assetService.calculateChecksum(file.path);

    try {
      const savedAsset = await this.assetService.createUserAsset(
        authUser,
        assetInfo,
        file.path,
        file.mimetype,
        checksum,
      );

      if (!savedAsset) {
        await this.backgroundTaskService.deleteFileOnDisk([
          {
            originalPath: file.path,
          } as any,
        ]); // simulate asset to make use of delete queue (or use fs.unlink instead)
        throw new BadRequestException('Asset not created');
      }

      await this.assetUploadedQueue.add(
        assetUploadedProcessorName,
        { asset: savedAsset, fileName: file.originalname },
        { jobId: savedAsset.id },
      );

      return new AssetFileUploadResponseDto(savedAsset.id);
    } catch (err) {
      await this.backgroundTaskService.deleteFileOnDisk([
        {
          originalPath: file.path,
        } as any,
      ]); // simulate asset to make use of delete queue (or use fs.unlink instead)

      if (err instanceof QueryFailedError && (err as any).constraint === 'UQ_userid_checksum') {
        const existedAsset = await this.assetService.getAssetByChecksum(authUser.id, checksum);
        res.status(200); // normal POST is 201. we use 200 to indicate the asset already exists
        return new AssetFileUploadResponseDto(existedAsset.id);
      }

      Logger.error(`Error uploading file ${err}`);
      throw new BadRequestException(`Error uploading file`, `${err}`);
    }
  }
*/

/*
  router.get('/download',
  require("./downloadFile"),
  //downloadFile,
  //@Query(new ValidationPipe({ transform: true })) query: ServeFileDto,
  //return this.assetService.downloadFile(query, res);
  );
  */



  router.post('/create',
  checkAuth,
  require("./createAsset"),
  //downloadFile,
  //@Query(new ValidationPipe({ transform: true })) query: ServeFileDto,
  //return this.assetService.downloadFile(query, res);
  );
  

/*
  router.get('/file',
  require("./file"),
  //serveFile
  //@Headers() headers: Record<string, string>,
  //@Query(new ValidationPipe({ transform: true })) query: ServeFileDto,
  //return this.assetService.serveFile(authUser, query, res, headers);
  );
*/

/*
  router.get('/thumbnail/:assetId',
  require("./getAssetThumbnail"),
  //@Header('Cache-Control', 'max-age=300')
  //getAssetThumbnail,
  //@Param('assetId') assetId: string,
  //@Query(new ValidationPipe({ transform: true })) query: GetAssetThumbnailDto,
  //return this.assetService.getAssetThumbnail(assetId, query, res);
  );
*/

/*
  router.get('/curated-objects',
  require("./getCuratedObjects"),
  //getCuratedObjects,
  //Promise<CuratedObjectsResponseDto[]> {
  //return this.assetService.getCuratedObject(authUser);
  );
*/

/*
  router.get('/curated-locations',
  require("./getCuratedLocations"),
  //getCuratedLocations,
  //Promise<CuratedLocationsResponseDto[]> {
  //return this.assetService.getCuratedLocation(authUser);
  );
*/

/*
  router.get('/search-terms',
  require("./getAssetSearchTerms"),
  //getAssetSearchTerms,
  //return this.assetService.getAssetSearchTerm(authUser);
  );
*/

/*
  router.post('/search',
  require("./searchAsset"),
  //searchAsset,
  //@Body(ValidationPipe) searchAssetDto: SearchAssetDto,
  //Promise<AssetResponseDto[]> {
  //return this.assetService.searchAsset(authUser, searchAssetDto);
  );
*/

/*
  router.post('/count-by-time-bucket',
  require("./getAssetCountByTimeBucket"),
  //getAssetCountByTimeBucket,
  //@Body(ValidationPipe) getAssetCountByTimeGroupDto: GetAssetCountByTimeBucketDto,
  //Promise<AssetCountByTimeBucketResponseDto> {
  //return this.assetService.getAssetCountByTimeBucket(authUser, getAssetCountByTimeGroupDto);
  );
*/

/*
  router.get('/count-by-user-id',
  require("./getAssetCountByUserId"),
  //getAssetCountByUserId,
  //Promise<AssetCountByUserIdResponseDto> {
  //return this.assetService.getAssetCountByUserId(authUser);
  );

  /**
   * Get all AssetEntity belong to the user
  */
 
  router.get('/',
  checkAuth,
  require("./getAllAssets"),
  //getAllAssets,
  //Promise<AssetResponseDto[]> {
  //return await this.assetService.getAllAssets(authUser);
  );


  /*
  router.post('/time-bucket',
  require("./getAssetByTimeBucket"),
  //getAssetByTimeBucket,
  //@Body(ValidationPipe) getAssetByTimeBucketDto: GetAssetByTimeBucketDto,
  //Promise<AssetResponseDto[]> {
  //return await this.assetService.getAssetByTimeBucket(authUser, getAssetByTimeBucketDto);
  );
  /**
   * Get all asset of a device that are in the database, ID only.
   */
  /*
  router.get('/:deviceId',
  require("./getUserAssetsByDevice"),
  //getUserAssetsByDevice,
  //@Param('deviceId') deviceId: string) {
  //return await this.assetService.getUserAssetsByDeviceId(authUser, deviceId);
  );
  */

  /**
   * Get a single asset's information
   */
  
  router.get('/assetById/:assetId',
  require("./getAssetById"),
  //getAssetById,
  //@Param('assetId') assetId: string,
  //Promise<AssetResponseDto> {
  //return await this.assetService.getAssetById(authUser, assetId);
  );
  

  
  router.delete('/:assetId',
  require("./deleteAsset"),
  //deleteAsset
  //@Body(ValidationPipe) assetIds: DeleteAssetDto,
  //Promise<DeleteAssetResponseDto[]> {
    /*
    const deleteAssetList: AssetResponseDto[] = [];

    for (const id of assetIds.ids) {
      const assets = await this.assetService.getAssetById(authUser, id);
      if (!assets) {
        continue;
      }
      deleteAssetList.push(assets);
    }

    const result = await this.assetService.deleteAssetById(authUser, assetIds);

    result.forEach((res) => {
      deleteAssetList.filter((a) => a.id == res.id && res.status == DeleteAssetStatusEnum.SUCCESS);
    });

    await this.backgroundTaskService.deleteFileOnDisk(deleteAssetList);

    return result;
    */
  );
  

  /**
   * Check duplicated asset before uploading - for Web upload used
   */
  /*
  router.post('/check')
  require("./checkDuplicateAsset"),
  res.status(200,
  //checkDuplicateAsset
  //@Body(ValidationPipe) checkDuplicateAssetDto: CheckDuplicateAssetDto,
  //Promise<CheckDuplicateAssetResponseDto> {
  //return await this.assetService.checkDuplicatedAsset(authUser, checkDuplicateAssetDto);
  );
  */

  /**
   * Checks if multiple assets exist on the server and returns all existing - used by background backup
   */
  /*
  router.post('/exist',
  require("./checkExistingAssets"),

    //checkExistingAssets,
    //@Body(ValidationPipe) checkExistingAssetsDto: CheckExistingAssetsDto,
    //Promise<CheckExistingAssetsResponseDto> {
    //return await this.assetService.checkExistingAssets(authUser, checkExistingAssetsDto);
  
);
*/

export default router;
