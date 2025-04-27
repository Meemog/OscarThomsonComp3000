import { useEffect, useState } from "react"
import { Outlet, Link } from "react-router-dom"
import { authenticate, logout } from "../scripts/auth"
import Cookies from "universal-cookie"

export default function Navbar() {
  const [userButton, setUserButton] = useState<JSX.Element>(<li className="hover:bg-gray-800 float-right"><Link to="/login" className="block text-white text-center text-lg px-3 py-4">Login</Link></li>)
  const [isAuth, setAuth] = useState<boolean>(false)

  useEffect(() => {
    if (!isAuth) {
      const auth = authenticate()
      
      auth.then((data) => {
        if (data.loggedIn) {
          setAuth(true)
          if (data.data!.type === "admin") {
            const cookies = new Cookies()
            cookies.remove("Token")
          } else {
            setUserButton(<UserButton username={data.data!.username} />)
          }
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
  username: string,
}

function UserButton({username}: UserButtonProps): JSX.Element {
  const [shown, setShown] = useState<boolean>(false)
  const [profilePicture, setProfilePicture] = useState("/pfp.png")
  const [isSet, setIsSet] = useState(false)

  useEffect(()=>{
    if(!isSet){
      const url = window.location
      const cookies = new Cookies()
      const token = cookies.get("Token")

      fetch(`http://${url.hostname}/api/getAccount/${username}`, {
          method: "GET",
          headers: {
              "Authorization": token
          }
      })
        .then(data => data.json())
        .then(jData => {
          setProfilePicture(jData.profilePicture)
          setIsSet(true)
        })
    }
  })

  function togglePopup() {
    setShown(!shown)
  }

  function logOut() {
    logout()
  }

  const url = window.location

  if (shown) {
    return (
      <>
      <li className="float-right hover:bg-gray-800">
        <button onClick={togglePopup}>
          <div className="grid grid-cols-2">
          <p className="block text-white text-center text-lg px-3 py-4" >{username}</p>
          <div className="flex items-center justify-center">
            <div className="border-solid border-2 rounded-full w-12 h-12">
                <img className="rounded-full" src={`http://${url.hostname}/images/${profilePicture}`} />
            </div>
          </div>
          </div>
        </button>
      </li>
      <li className="hover:bg-gray-800 float-right"><button className="block text-white text-center text-lg px-3 py-4" onClick={logOut}>Logout</button></li>
      <li className="hover:bg-gray-800 float-right"><Link to={`/timetable/${username}`} className="block text-white text-center text-lg px-3 py-4">TimeTable</Link></li>
      <li className="hover:bg-gray-800 float-right"><Link to={`/account/${username}`} className="block text-white text-center text-lg px-3 py-4">Account</Link></li>
      </>
    )
  } else {
    return (
      <li className="float-right hover:bg-gray-800">
        <button onClick={togglePopup}>
          <div className="grid grid-cols-2">
          <p className="block text-white text-center text-lg px-3 py-4" >{username}</p>
          <div className="flex items-center justify-center">
            <div className="border-solid border-2 rounded-full w-12 h-12">
                <img className="rounded-full" src={`http://${url.hostname}/images/${profilePicture}`} />
            </div>
          </div>
          </div>
        </button>
      </li>
    )
  }
}