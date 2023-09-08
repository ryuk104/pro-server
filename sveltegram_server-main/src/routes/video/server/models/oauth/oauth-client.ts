import { AllowNull, Column, CreatedAt, DataType, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript'
import { AttributesOnly } from '@peertube/peertube-typescript-utils'
import { OAuthTokenModel } from './oauth-token.js'

@Table({
  tableName: 'oAuthClient',
  indexes: [
    {
      fields: [ 'clientId' ],
      unique: true
    },
    {
      fields: [ 'clientId', 'clientSecret' ],
      unique: true
    }
  ]
})
export class OAuthClientModel extends Model<Partial<AttributesOnly<OAuthClientModel>>> {

  @AllowNull(false)
  @Column
  clientId: string

  @AllowNull(false)
  @Column
  clientSecret: string

  @Column(DataType.ARRAY(DataType.STRING))
  grants: string[]

  @Column(DataType.ARRAY(DataType.STRING))
  redirectUris: string[]

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  @HasMany(() => OAuthTokenModel, {
    onDelete: 'cascade'
  })
  OAuthTokens: Awaited<OAuthTokenModel>[]

  static countTotal () {
    return OAuthClientModel.count()
  }

  static loadFirstClient () {
    return OAuthClientModel.findOne()
  }

  static getByIdAndSecret (clientId: string, clientSecret: string) {
    const query = {
      where: {
        clientId,
        clientSecret
      }
    }

    return OAuthClientModel.findOne(query)
  }
}
