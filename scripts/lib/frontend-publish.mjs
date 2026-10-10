// Cross-platform frontend publication: build + S3 sync + CloudFront invalidation.
//
// Reproduces deploy-frontend.sh without the AWS CLI or Unix tools. The S3 sync
// is implemented with the AWS SDK v3 so it runs natively on Windows:
//   1. Walk apps/web/dist recursively with fs (no `find`).
//   2. Upload every file with the correct Content-Type and Cache-Control:
//        - assets/**            public, max-age=31536000, immutable
//        - index.html           no-cache
//        - everything else      public, max-age=86400
//   3. Delete objects in the bucket that are no longer in the build (the
//      `--delete` behavior of the old `aws s3 sync`).
//   4. Invalidate CloudFront for /*.
//
// Secrets are never logged.

import fs from 'node:fs';
import path from 'node:path';
import mime from 'mime-types';
import {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { CreateInvalidationCommand } from '@aws-sdk/client-cloudfront';
import { s3Client, cloudFrontClient } from './aws-clients.mjs';
import { run } from './exec.mjs';
import { webDir, webDistDir } from './paths.mjs';
import * as log from './console.mjs';

const CACHE = {
  immutable: 'public, max-age=31536000, immutable',
  noCache: 'no-cache',
  default: 'public, max-age=86400',
};

/**
 * Build the frontend with production configuration derived from CloudFormation
 * outputs. The VITE_* values are injected via the child process environment so
 * Vite embeds them at build time; they are not written to disk.
 */
export async function buildFrontend(viteEnv) {
  log.blank();
  log.step('🔨 Building the frontend with production configuration...');
  await run('npm', ['run', 'build', '-w', '@kiro-essentials/web'], {
    cwd: webDir,
    env: viteEnv,
  });
  log.ok('Build complete.');
}

/** Recursively collect every file under `dir`, returning absolute paths. */
function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (entry.isFile()) {
      files.push(full);
    }
  }
  return files;
}

/**
 * Convert an absolute file path under the build dir into an S3 object key.
 * Always uses forward slashes, even on Windows where path.sep is a backslash.
 */
function toS3Key(absolutePath) {
  const relative = path.relative(webDistDir, absolutePath);
  return relative.split(path.sep).join('/');
}

/** Pick the Cache-Control value for a given S3 key, matching the old rules. */
function cacheControlFor(key) {
  if (key === 'index.html') return CACHE.noCache;
  if (key.startsWith('assets/')) return CACHE.immutable;
  return CACHE.default;
}

/** Resolve a Content-Type for a key, defaulting to octet-stream. */
function contentTypeFor(key) {
  return mime.lookup(key) || 'application/octet-stream';
}

/**
 * Publish the already-built dist directory to S3 with differential caching,
 * remove stale objects, and invalidate CloudFront.
 */
export async function publishToS3({ bucketName, distributionId }) {
  if (!fs.existsSync(webDistDir)) {
    throw new Error(
      `Build output not found at ${webDistDir}. Did the frontend build succeed?`,
    );
  }

  const s3 = s3Client();
  const localFiles = walk(webDistDir);
  const uploadedKeys = new Set();

  log.blank();
  log.step('🚀 Uploading to S3...');

  for (const file of localFiles) {
    const key = toS3Key(file);
    uploadedKeys.add(key);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fs.readFileSync(file),
        ContentType: contentTypeFor(key),
        CacheControl: cacheControlFor(key),
      }),
    );
  }
  log.ok(`Uploaded ${uploadedKeys.size} file(s).`);

  // ─── Delete stale objects (the old `aws s3 sync --delete` behavior) ──────────
  const staleKeys = await listStaleKeys(bucketName, uploadedKeys);
  if (staleKeys.length > 0) {
    await deleteKeys(bucketName, staleKeys);
    log.ok(`Removed ${staleKeys.length} stale object(s).`);
  } else {
    log.info('No stale objects to remove.');
  }

  // ─── CloudFront invalidation ────────────────────────────────────────────────
  log.blank();
  log.step('🔄 Invalidating CloudFront cache...');
  await cloudFrontClient().send(
    new CreateInvalidationCommand({
      DistributionId: distributionId,
      InvalidationBatch: {
        CallerReference: `workshop-${Date.now()}`,
        Paths: { Quantity: 1, Items: ['/*'] },
      },
    }),
  );
  log.ok('Invalidation created for /*.');
}

/** List bucket keys that are not part of the latest build. */
async function listStaleKeys(bucketName, keepKeys) {
  const s3 = s3Client();
  const stale = [];
  let continuationToken;
  do {
    const response = await s3.send(
      new ListObjectsV2Command({
        Bucket: bucketName,
        ContinuationToken: continuationToken,
      }),
    );
    for (const object of response.Contents ?? []) {
      if (object.Key && !keepKeys.has(object.Key)) stale.push(object.Key);
    }
    continuationToken = response.IsTruncated
      ? response.NextContinuationToken
      : undefined;
  } while (continuationToken);
  return stale;
}

/** Delete keys in batches of 1000 (the DeleteObjects API limit). */
async function deleteKeys(bucketName, keys) {
  const s3 = s3Client();
  for (let i = 0; i < keys.length; i += 1000) {
    const batch = keys.slice(i, i + 1000);
    await s3.send(
      new DeleteObjectsCommand({
        Bucket: bucketName,
        Delete: { Objects: batch.map((Key) => ({ Key })), Quiet: true },
      }),
    );
  }
}
