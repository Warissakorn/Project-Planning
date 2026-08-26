import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAppStore } from '../state/store'
import { useStructureData } from '../state/selectors'
import { hasSchedulingStructure } from '../engine/validation'
import { AppHeader } from '../components/layout/AppHeader'
import { StatusBar } from '../components/layout/StatusBar'
import { StructureTabs } from '../components/tree/StructureTabs'
import { TreeToolbar } from '../components/tree/TreeToolbar'
import { StructureTree } from '../components/tree/StructureTree'
import { GanttView } from '../components/gantt/GanttView'
import { ReportsView } from '../components/reports/ReportsView'
import { NodeInspector } from '../components/inspector/NodeInspector'

/**
 * The planning workspace: header + structure tabs + tree/gantt pane +
 * inspector + status bar. Keeps the store's active pointers in sync with the
 * URL (`/project/:projectId`), and binds global undo/redo shortcuts.
 */
export function WorkspacePage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const exists = useAppStore((s) => !!projectId && !!s.projects[projectId])
  const viewMode = useAppStore((s) => s.viewMode)
  const { project, typeConfig } = useStructureData()

  // URL → store sync; unknown ids bounce back to the list.
  useEffect(() => {
    if (!projectId || !useAppStore.getState().projects[projectId]) {
      navigate('/', { replace: true })
      return
    }
    if (useAppStore.getState().activeProjectId !== projectId) {
      useAppStore.getState().setActiveProject(projectId)
    }
  }, [projectId, navigate])

  // Global Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y — skipped while typing in fields.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      const el = document.activeElement as HTMLElement | null
      if (
        el &&
        (el.tagName === 'INPUT' ||
          el.tagName === 'TEXTAREA' ||
          el.tagName === 'SELECT' ||
          el.isContentEditable)
      ) {
        return
      }
      const st = useAppStore.getState()
      if (e.key === 'z' || e.key === 'Z') {
        e.preventDefault()
        if (e.shiftKey) st.redo()
        else st.undo()
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault()
        st.redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!projectId || !exists) return null

  const showGantt = viewMode === 'gantt' && !!typeConfig?.capabilities.scheduling
  // Guards a stale persisted 'reports' in a project that lost its scheduling
  // structure — falls back to the tree instead of stranding the user.
  const canReport = !!project && hasSchedulingStructure(project.structures)

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <AppHeader />
      <div className="flex min-h-0 flex-1">
        <main className="flex min-w-0 flex-1 flex-col">
          <StructureTabs />
          <TreeToolbar />
          {viewMode === 'reports' && canReport ? <ReportsView /> : showGantt ? <GanttView /> : <StructureTree />}
        </main>
        <NodeInspector />
      </div>
      <StatusBar />
    </div>
  )
}
