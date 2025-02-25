import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { 
  createBrowserRouter,
  RouterProvider
 } from 'react-router'

import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <h1 className='text-xl'>Clock</h1>,
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
