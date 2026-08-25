/**
 * JSON export/import envelope. Exported files carry `schemaVersion` and run
 * through the SAME migrate chain as the localStorage persist middleware, so a
 * backup from an older app version still imports cleanly.
 */

import type { Project } from '../model/types'

export const SCHEMA_VERSION = 1

export interface ExportEnvelope {
  schemaVersion: number
  app: 'breakdown-planner'
  exportedAt: string
  project: Project
}

export function makeEnvelope(project: Project): ExportEnvelope {
  return {
    schemaVersion: SCHEMA_VERSION,
    app: 'breakdown-planner',
    exportedAt: new Date().toISOString(),
    project,
  }
}

/** Migration chain — one step per breaking storage-schema bump. */
function migrateProject(project: Project, fromVersion: number): Project {
  let p = project
  let v = fromVersion
  // if (v < 2) { p = migrateV1toV2(p); v = 2 }
  void v
  return p
}

/**
 * Parse + validate an imported JSON string. Throws Error with a plain-text
 * reason on anything that isn't a plausible Breakdown Planner export.
 */
export function parseImportedProject(text: string): Project {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new Error('invalid-json')
  }
  if (typeof data !== 'object' || data === null) throw new Error('invalid-format')
  const env = data as Partial<ExportEnvelope>
  if (env.app !== 'breakdown-planner' || typeof env.schemaVersion !== 'number') {
    throw new Error('invalid-format')
  }
  if (env.schemaVersion > SCHEMA_VERSION) throw new Error('newer-version')
  const raw = env.project as Project | undefined
  if (
    !raw ||
    typeof raw.id !== 'string' ||
    typeof raw.name !== 'string' ||
    !Array.isArray(raw.structures) ||
    typeof raw.nodes !== 'object' ||
    raw.nodes === null ||
    !Array.isArray(raw.dependencies) ||
    !Array.isArray(raw.links)
  ) {
    throw new Error('invalid-format')
  }
  return migrateProject(raw, env.schemaVersion)
}

export function importErrorMessage(err: unknown): 'invalid-json' | 'invalid-format' | 'newer-version' {
  const msg = err instanceof Error ? err.message : ''
  if (msg === 'newer-version') return 'newer-version'
  if (msg === 'invalid-json') return 'invalid-json'
  return 'invalid-format'
}

/** Trigger a client-side file download for text content. */
export function downloadFile(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

/** Strip characters filesystems dislike; keep Thai letters and spaces. */
export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, '_').trim() || 'untitled'
}
