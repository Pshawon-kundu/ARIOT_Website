/**
 * Storage service barrel (STORAGE-1R / D-067 + D-068).
 *
 * Thin re-export keeping the route handlers' import paths stable after the
 * upload flow was split into upload-context / upload-initiate / upload-persist
 * / upload-complete / local-upload (300-line file limit, AGENTS.md §10).
 */

export {
  initiateUpload,
  type InitiateUploadResult,
  PRESIGN_EXPIRY_SECONDS,
} from './upload-initiate';
export {
  completeUpload,
  type CompleteUploadInput,
  PUBLIC_CACHE_CONTROL,
  SIGNATURE_READ_BYTES,
} from './upload-complete';
export type { CompletedAssetDto, CompleteUploadResult } from './upload-persist';
export { localUploadFromForm, type LocalUploadDeps } from './local-upload';
export {
  getMediaStorageProvider,
  resolveProviderName,
  type MediaStorageProvider,
  type MediaStorageProviderName,
} from './get-media-storage-provider';
