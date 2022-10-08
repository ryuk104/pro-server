import { pathExists, readdir, remove } from 'fs-extra'
import { basename, join } from 'path'
import { logger } from '@server/helpers/logger'
import { MStreamingPlaylist, MStreamingPlaylistVideo, MVideo } from '@server/types/models'
import { VideoStorage } from '@shared/models'
import { listHLSFileKeysOf, removeHLSFileObjectStorage, removeHLSObjectStorage } from '../object-storage'
import { getLiveDirectory } from '../paths'

function buildConcatenatedName (segmentOrPlaylistPath: string) {
  const num = basename(segmentOrPlaylistPath).match(/^(\d+)(-|\.)/)

  return 'concat-' + num[1] + '.ts'
}

async function cleanupAndDestroyPermanentLive (video: MVideo, streamingPlaylist: MStreamingPlaylist) {
  await cleanupTMPLiveFiles(video, streamingPlaylist)

  await streamingPlaylist.destroy()
}

async function cleanupUnsavedNormalLive (video: MVideo, streamingPlaylist: MStreamingPlaylist) {
  const hlsDirectory = getLiveDirectory(video)

  // We uploaded files to object storage too, remove them
  if (streamingPlaylist.storage === VideoStorage.OBJECT_STORAGE) {
    await removeHLSObjectStorage(streamingPlaylist.withVideo(video))
  }

  await remove(hlsDirectory)

  await streamingPlaylist.destroy()
}

async function cleanupTMPLiveFiles (video: MVideo, streamingPlaylist: MStreamingPlaylist) {
  await cleanupTMPLiveFilesFromObjectStorage(streamingPlaylist.withVideo(video))

  await cleanupTMPLiveFilesFromFilesystem(video)
}

export {
  cleanupAndDestroyPermanentLive,
  cleanupUnsavedNormalLive,
  cleanupTMPLiveFiles,
  buildConcatenatedName
}

// ---------------------------------------------------------------------------

function isTMPLiveFile (name: string) {
  return name.endsWith('.ts') ||
    name.endsWith('.m3u8') ||
    name.endsWith('.json') ||
    name.endsWith('.mpd') ||
    name.endsWith('.m4s') ||
    name.endsWith('.tmp')
}

async function cleanupTMPLiveFilesFromFilesystem (video: MVideo) {
  const hlsDirectory = getLiveDirectory(video)

  if (!await pathExists(hlsDirectory)) return

  logger.info('Cleanup TMP live files from filesystem of %s.', hlsDirectory)

  const files = await readdir(hlsDirectory)

  for (const filename of files) {
    if (isTMPLiveFile(filename)) {
      const p = join(hlsDirectory, filename)

      remove(p)
        .catch(err => logger.error('Cannot remove %s.', p, { err }))
    }
  }
}

async function cleanupTMPLiveFilesFromObjectStorage (streamingPlaylist: MStreamingPlaylistVideo) {
  if (streamingPlaylist.storage !== VideoStorage.OBJECT_STORAGE) return

  const keys = await listHLSFileKeysOf(streamingPlaylist)

  for (const key of keys) {
    if (isTMPLiveFile(key)) {
      await removeHLSFileObjectStorage(streamingPlaylist, key)
    }
  }
}
