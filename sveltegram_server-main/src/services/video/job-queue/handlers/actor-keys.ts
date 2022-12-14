import { Job } from 'bullmq'
import { generateAndSaveActorKeys } from '@server/lib/activitypub/actors'
import { ActorModel } from '@server/models/actor/actor'
import { ActorKeysPayload } from '@shared/models'
import { logger } from '../../../helpers/logger'

async function processActorKeys (job: Job) {
  const payload = job.data as ActorKeysPayload
  logger.info('Processing actor keys in job %s.', job.id)

  const actor = await ActorModel.load(payload.actorId)

  await generateAndSaveActorKeys(actor)
}

// ---------------------------------------------------------------------------

export {
  processActorKeys
}
