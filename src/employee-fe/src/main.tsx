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
import Login from './pages/Login'

import './index.css'
import Account from './pages/Account'
import Timetable from './pages/Timetable'
import ShiftView from './pages/ShiftView'

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
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/account/:username",
        element: <Account />,
      },
      {
        path: "/timetable/:username",
        element: <Timetable />,
      },
      {
        path: "/timetable/:username/:date",
        element: <ShiftView />,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)