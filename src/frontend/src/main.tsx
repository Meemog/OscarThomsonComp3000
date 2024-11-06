import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider
} from 'react-router-dom'

import Navbar from './elements/Navbar'

import Homepage from './pages/Homepage'
import About from './pages/About'
import Database from './pages/Database'

import './index.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navbar />,
    children: [
      {
        path: "/",
        element: <Homepage />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/database",
        element: <Database />,
      },
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)