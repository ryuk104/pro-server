//notes
import 'reflect-metadata'

import * as express from 'express'
import { ContentType } from '@standardnotes/common'

import { ItemsController } from './ItemsController'
import { results } from 'inversify-express-utils'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { SyncResponseFactoryInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryInterface'
import { SyncResponse20200115 } from '../Domain/Item/SyncResponse/SyncResponse20200115'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { Item } from '../Domain/Item/Item'
import { ProjectorInterface } from '../Projection/ProjectorInterface'
import { ItemProjection } from '../Projection/ItemProjection'


import { Request, Response } from 'express'
import { inject } from 'inversify'
import { BaseHttpController, controller, httpGet, httpPost, results } from 'inversify-express-utils'
import TYPES from '../Bootstrap/Types'
import { ApiVersion } from '../Domain/Api/ApiVersion'
import { Item } from '../Domain/Item/Item'
import { SyncResponseFactoryResolverInterface } from '../Domain/Item/SyncResponse/SyncResponseFactoryResolverInterface'
import { CheckIntegrity } from '../Domain/UseCase/CheckIntegrity/CheckIntegrity'
import { GetItem } from '../Domain/UseCase/GetItem/GetItem'
import { SyncItems } from '../Domain/UseCase/SyncItems'
import { ItemProjection } from '../Projection/ItemProjection'
import { ProjectorInterface } from '../Projection/ProjectorInterface'

@controller('/items', TYPES.AuthMiddleware)
export class ItemsController extends BaseHttpController {
  constructor(
    @inject(TYPES.SyncItems) private syncItems: SyncItems,
    @inject(TYPES.CheckIntegrity) private checkIntegrity: CheckIntegrity,
    @inject(TYPES.GetItem) private getItem: GetItem,
    @inject(TYPES.ItemProjector) private itemProjector: ProjectorInterface<Item, ItemProjection>,
    @inject(TYPES.SyncResponseFactoryResolver)
    private syncResponseFactoryResolver: SyncResponseFactoryResolverInterface,
  ) {
    super()
  }

  @httpPost('/sync')
  public async sync(request: Request, response: Response): Promise<results.JsonResult> {
    let itemHashes = []
    if ('items' in request.body) {
      itemHashes = request.body.items
    }

    const syncResult = await this.syncItems.execute({
      userUuid: response.locals.user.uuid,
      itemHashes,
      computeIntegrityHash: request.body.compute_integrity === true,
      syncToken: request.body.sync_token,
      cursorToken: request.body.cursor_token,
      limit: request.body.limit,
      contentType: request.body.content_type,
      apiVersion: request.body.api ?? ApiVersion.v20161215,
      readOnlyAccess: response.locals.readOnlyAccess,
      analyticsId: response.locals.analyticsId,
      sessionUuid: response.locals.session ? response.locals.session.uuid : null,
    })

    const syncResponse = await this.syncResponseFactoryResolver
      .resolveSyncResponseFactoryVersion(request.body.api)
      .createResponse(syncResult)

    return this.json(syncResponse)
  }

  @httpPost('/check-integrity')
  public async checkItemsIntegrity(request: Request, response: Response): Promise<results.JsonResult> {
    let integrityPayloads = []
    if ('integrityPayloads' in request.body) {
      integrityPayloads = request.body.integrityPayloads
    }

    const result = await this.checkIntegrity.execute({
      userUuid: response.locals.user.uuid,
      integrityPayloads,
    })

    return this.json(result)
  }

  @httpGet('/:uuid')
  public async getSingleItem(
    request: Request,
    response: Response,
  ): Promise<results.NotFoundResult | results.JsonResult> {
    const result = await this.getItem.execute({
      userUuid: response.locals.user.uuid,
      itemUuid: request.params.uuid,
    })

    if (!result.success) {
      return this.notFound()
    }

    return this.json({ item: await this.itemProjector.projectFull(result.item) })
  }
}

describe('ItemsController', () => {
  let syncItems: SyncItems
  let checkIntegrity: CheckIntegrity
  let getItem: GetItem
  let itemProjector: ProjectorInterface<Item, ItemProjection>
  let request: express.Request
  let response: express.Response
  let syncResponceFactoryResolver: SyncResponseFactoryResolverInterface
  let syncResponseFactory: SyncResponseFactoryInterface
  let syncResponse: SyncResponse20200115

  const createController = () =>
    new ItemsController(syncItems, checkIntegrity, getItem, itemProjector, syncResponceFactoryResolver)

  beforeEach(() => {
    itemProjector = {} as jest.Mocked<ProjectorInterface<Item, ItemProjection>>
    itemProjector.projectFull = jest.fn().mockReturnValue({ foo: 'bar' })

    syncItems = {} as jest.Mocked<SyncItems>
    syncItems.execute = jest.fn().mockReturnValue({ foo: 'bar' })

    checkIntegrity = {} as jest.Mocked<CheckIntegrity>
    checkIntegrity.execute = jest.fn().mockReturnValue({ mismatches: [{ uuid: '1-2-3', updated_at_timestamp: 2 }] })

    getItem = {} as jest.Mocked<GetItem>
    getItem.execute = jest.fn().mockReturnValue({ success: true, item: {} as jest.Mocked<Item> })

    request = {
      headers: {},
      body: {},
      params: {},
    } as jest.Mocked<express.Request>

    request.body.api = ApiVersion.v20200115
    request.body.sync_token = 'MjoxNjE3MTk1MzQyLjc1ODEyMTc='
    request.body.limit = 150
    request.body.compute_integrity = false
    request.headers['user-agent'] = 'Google Chrome'
    request.body.items = [
      {
        content: 'test',
        content_type: ContentType.Note,
        created_at: '2021-02-19T11:35:45.655Z',
        deleted: false,
        duplicate_of: null,
        enc_item_key: 'test',
        items_key_id: 'test',
        updated_at: '2021-02-19T11:35:45.655Z',
        uuid: '1-2-3',
      },
    ]

    response = {
      locals: {},
    } as jest.Mocked<express.Response>
    response.locals.user = {
      uuid: '123',
    }
    response.locals.analyticsId = 123

    syncResponse = {} as jest.Mocked<SyncResponse20200115>

    syncResponseFactory = {} as jest.Mocked<SyncResponseFactoryInterface>
    syncResponseFactory.createResponse = jest.fn().mockReturnValue(syncResponse)

    syncResponceFactoryResolver = {} as jest.Mocked<SyncResponseFactoryResolverInterface>
    syncResponceFactoryResolver.resolveSyncResponseFactoryVersion = jest.fn().mockReturnValue(syncResponseFactory)
  })

  it('should get a single item', async () => {
    request.params.uuid = '1-2-3'
    const httpResponse = <results.JsonResult>await createController().getSingleItem(request, response)
    const result = await httpResponse.executeAsync()

    expect(getItem.execute).toHaveBeenCalledWith({
      itemUuid: '1-2-3',
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should return 404 on a missing single item', async () => {
    request.params.uuid = '1-2-3'
    getItem.execute = jest.fn().mockReturnValue({ success: false })

    const httpResponse = <results.NotFoundResult>await createController().getSingleItem(request, response)
    const result = await httpResponse.executeAsync()

    expect(getItem.execute).toHaveBeenCalledWith({
      itemUuid: '1-2-3',
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(404)
  })

  it('should check items integrity', async () => {
    request.body.integrityPayloads = [
      {
        uuid: '1-2-3',
        updated_at_timestamp: 1,
      },
    ]

    const httpResponse = <results.JsonResult>await createController().checkItemsIntegrity(request, response)
    const result = await httpResponse.executeAsync()

    expect(checkIntegrity.execute).toHaveBeenCalledWith({
      integrityPayloads: [
        {
          updated_at_timestamp: 1,
          uuid: '1-2-3',
        },
      ],
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"mismatches":[{"uuid":"1-2-3","updated_at_timestamp":2}]}',
    )
  })

  it('should check items integrity with missing request parameter', async () => {
    const httpResponse = <results.JsonResult>await createController().checkItemsIntegrity(request, response)
    const result = await httpResponse.executeAsync()

    expect(checkIntegrity.execute).toHaveBeenCalledWith({
      integrityPayloads: [],
      userUuid: '123',
    })

    expect(result.statusCode).toEqual(200)
    expect(await result.content.readAsStringAsync()).toEqual(
      '{"mismatches":[{"uuid":"1-2-3","updated_at_timestamp":2}]}',
    )
  })

  it('should sync items', async () => {
    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      analyticsId: 123,
      sessionUuid: null,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should sync items with defaulting API version if none specified', async () => {
    delete request.body.api

    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20161215',
      computeIntegrityHash: false,
      itemHashes: [
        {
          content: 'test',
          content_type: 'Note',
          created_at: '2021-02-19T11:35:45.655Z',
          deleted: false,
          duplicate_of: null,
          enc_item_key: 'test',
          items_key_id: 'test',
          updated_at: '2021-02-19T11:35:45.655Z',
          uuid: '1-2-3',
        },
      ],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      analyticsId: 123,
      sessionUuid: null,
    })

    expect(result.statusCode).toEqual(200)
  })

  it('should sync items with no incoming items in request', async () => {
    response.locals.session = { uuid: '2-3-4' }
    delete request.body.items

    const httpResponse = <results.JsonResult>await createController().sync(request, response)
    const result = await httpResponse.executeAsync()

    expect(syncItems.execute).toHaveBeenCalledWith({
      apiVersion: '20200115',
      computeIntegrityHash: false,
      itemHashes: [],
      limit: 150,
      syncToken: 'MjoxNjE3MTk1MzQyLjc1ODEyMTc=',
      userUuid: '123',
      analyticsId: 123,
      sessionUuid: '2-3-4',
    })

    expect(result.statusCode).toEqual(200)
  })
})

