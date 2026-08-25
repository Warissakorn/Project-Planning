import type { StateCreator } from 'zustand'
import { cloneProject, newProject } from '../../model/defaults'
import type { ID, Project } from '../../model/types'
import type { AppState } from '../store'

export interface ProjectsSlice {
  projects: Record<ID, Project>
  /** Display order of the project list page. */
  projectOrder: ID[]

  createProject: (name: string) => ID
  renameProject: (id: ID, name: string) => void
  duplicateProjectById: (id: ID) => ID | null
  deleteProject: (id: ID) => void
  /** Used by JSON import; replaces nothing — adds as a new project. */
  addImportedProject: (project: Project) => ID
}

export const createProjectsSlice: StateCreator<
  AppState,
  [['zustand/immer', never]],
  [],
  ProjectsSlice
> = (set, get) => ({
  projects: {},
  projectOrder: [],

  createProject: (name) => {
    const project = newProject(name.trim() === '' ? 'Untitled' : name.trim())
    const id = project.id
    set((d) => {
      d.projects[id] = project
      d.projectOrder.unshift(id)
      d.activeProjectId = id
      d.activeStructureId = project.structures[0]?.id ?? null
      d.selectedNodeId = null
      d.viewMode = 'tree'
      d.historyPast = []
      d.historyFuture = []
    })
    return id
  },

  renameProject: (id, name) => {
    set((d) => {
      const p = d.projects[id]
      if (!p) return
      p.name = name.trim()
      p.updatedAt = Date.now()
    })
  },

  duplicateProjectById: (id) => {
    const source = get().projects[id]
    if (!source) return null
    const copy = cloneProject(source, `${source.name} (copy)`)
    const newId = copy.id
    set((d) => {
      d.projects[newId] = copy
      const srcIdx = d.projectOrder.indexOf(id)
      d.projectOrder.splice(srcIdx < 0 ? 0 : srcIdx, 0, newId)
    })
    return newId
  },

  deleteProject: (id) => {
    set((d) => {
      delete d.projects[id]
      d.projectOrder = d.projectOrder.filter((pid) => pid !== id)
      if (d.activeProjectId === id) {
        d.activeProjectId = null
        d.activeStructureId = null
        d.selectedNodeId = null
        d.historyPast = []
        d.historyFuture = []
      }
    })
  },

  addImportedProject: (project) => {
    let finalId = project.id
    set((d) => {
      // Never collide with an existing id.
      if (d.projects[finalId]) {
        finalId = `${finalId}-import-${Date.now().toString(36)}`
        project = { ...project, id: finalId }
      }
      d.projects[finalId] = project
      d.projectOrder.unshift(finalId)
    })
    return finalId
  },
})
