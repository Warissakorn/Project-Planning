// @vitest-environment jsdom
// Store-level import tests — needs jsdom for the persist middleware's localStorage.
import { beforeEach, expect, it } from 'vitest'
import { STORE_KEY, useAppStore } from '../store'
import { newProject } from '../../model/defaults'

beforeEach(() => {
  localStorage.clear()
  useAppStore.setState({
    projects: {},
    projectOrder: [],
    activeProjectId: null,
    activeStructureId: null,
    selectedNodeId: null,
  })
})

it('addImportedProject keeps a non-colliding id as-is', () => {
  const backup = newProject('Backup')
  const returned = useAppStore.getState().addImportedProject(backup)

  expect(returned).toBe(backup.id)
  expect(useAppStore.getState().projectOrder[0]).toBe(backup.id)
})

it('imported duplicate ids get a fresh id instead of clobbering the original', () => {
  const existingId = useAppStore.getState().createProject('Existing')

  // Simulate re-importing a backup of a project that is already in storage.
  const backup = newProject('Restored')
  backup.id = existingId

  const returned = useAppStore.getState().addImportedProject(backup)

  expect(returned).not.toBe(existingId)
  expect(useAppStore.getState().projects[returned]?.name).toBe('Restored')
  expect(useAppStore.getState().projects[existingId]?.name).toBe('Existing')
  expect(useAppStore.getState().projectOrder[0]).toBe(returned)
})

it('persist middleware writes the store key', () => {
  useAppStore.getState().createProject('Persisted')
  expect(localStorage.getItem(STORE_KEY)).toContain('Persisted')
})
