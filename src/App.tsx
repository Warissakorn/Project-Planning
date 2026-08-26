import { useEffect } from 'react'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import { ProjectListPage } from './routes/ProjectListPage'
import { WorkspacePage } from './routes/WorkspacePage'
import { useAppStore } from './state/store'

// Hash router so the built app runs from any static host without rewrites.
const router = createHashRouter([
  { path: '/', element: <ProjectListPage /> },
  { path: '/project/:projectId', element: <WorkspacePage /> },
])

export default function App() {
  const lang = useAppStore((s) => s.lang)

  // index.html ships lang="th"; keep the document honest once the stored or
  // detected preference is known, so screen readers and the browser's own
  // translation prompt follow the language actually on screen.
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return <RouterProvider router={router} />
}
