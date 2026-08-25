import { createHashRouter, RouterProvider } from 'react-router-dom'
import { ProjectListPage } from './routes/ProjectListPage'
import { WorkspacePage } from './routes/WorkspacePage'

// Hash router so the built app runs from any static host without rewrites.
const router = createHashRouter([
  { path: '/', element: <ProjectListPage /> },
  { path: '/project/:projectId', element: <WorkspacePage /> },
])

export default function App() {
  return <RouterProvider router={router} />
}
