import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { 
  createBrowserRouter,
  RouterProvider
 } from 'react-router'

import Login from './pages/Login'
import Home from './pages/Home'
import Accounts from './pages/Accounts'
import NewAccount from './pages/NewAccount'

import './index.css'
import EditAccount from './pages/EditAccount'


const router = createBrowserRouter([
  {
    path: "/",
    element: <Login />,
  },
  {
    path: "/home",
    element: <Home />
  },
  {
    path: "/accounts",
    element: <Accounts />
  },
  {
    path: "accounts/:username",
    element: <EditAccount />
  },
  {
    path: "/new-account",
    element: <NewAccount />
  }

])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
