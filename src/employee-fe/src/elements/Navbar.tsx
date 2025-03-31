import { useEffect, useState } from "react"
import { Outlet, Link } from "react-router-dom"
import { authenticate, logout } from "../scripts/auth"

export default function Navbar() {
  const [userButton, setUserButton] = useState<JSX.Element>(<li className="hover:bg-gray-800 float-right"><Link to="/login" className="block text-white text-center text-lg px-3 py-4">Login</Link></li>)
  const [isAuth, setAuth] = useState<boolean>(false)

  useEffect(() => {
    if (!isAuth) {
      const auth = authenticate()
      
      auth.then((data) => {
        if (data.loggedIn) {
          setUserButton(<UserButton username={data.data!.username} />)
          setAuth(true)
        }
      })
    }
  })


  return (
    <>
      <ul className="overflow-hidden list-none bg-gray-700">
        <li className="float-left hover:bg-gray-800"><Link to="/" className="block text-white text-center text-lg px-3 py-4">Home</Link></li>
        <li className="float-left hover:bg-gray-800"><Link to="/about" className="block text-white text-center text-lg px-3 py-4">About</Link></li>
        {userButton}
      </ul>
      <div className="mx-2">
        <Outlet />
      </div>
    </>
  )
}

type UserButtonProps = {
  username: string
}

function UserButton({username}: UserButtonProps): JSX.Element {
  const [shown, setShown] = useState<boolean>(false)

  function togglePopup() {
    setShown(!shown)
  }

  function logOut() {
    logout()
  }

  if (shown) {
    return (
      <>
      <li className="float-right hover:bg-gray-800">
      <button className="block text-white text-center text-lg px-3 py-4" onClick={togglePopup}>{username}</button>
      </li>
      <li className="hover:bg-gray-800 float-right"><button className="block text-white text-center text-lg px-3 py-4" onClick={logOut}>Logout</button></li>
      <li className="hover:bg-gray-800 float-right"><Link to="/timetable" className="block text-white text-center text-lg px-3 py-4">TimeTable</Link></li>
      <li className="hover:bg-gray-800 float-right"><Link to={`/account/${username}`} className="block text-white text-center text-lg px-3 py-4">Account</Link></li>
      </>
    )
  } else {
    return <li className="float-right hover:bg-gray-800"><button className="block text-white text-center text-lg px-3 py-4" onClick={togglePopup}>{username}</button></li>
  }
}