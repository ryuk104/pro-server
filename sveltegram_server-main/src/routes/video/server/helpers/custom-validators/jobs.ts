import { JobState } from '@peertube/peertube-models'
import { jobTypes } from '@server/lib/job-queue/job-queue.js'
import { exists } from './misc.js'

const jobStates: JobState[] = [ 'active', 'completed', 'failed', 'waiting', 'delayed', 'paused', 'waiting-children' ]

function isValidJobState (value: JobState) {
  return exists(value) && jobStates.includes(value)
}

function isValidJobType (value: any) {
  return exists(value) && jobTypes.includes(value)
}

// ---------------------------------------------------------------------------

export {
  jobStates,
  isValidJobState,
  isValidJobType
}
