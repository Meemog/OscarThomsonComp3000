import { Outlet, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <ul className="overflow-hidden list-none bg-gray-700">
        <li className="float-left hover:bg-gray-800"><Link to="/" className="block text-white text-center text-lg px-3 py-4">Home</Link></li>
        <li className="float-left hover:bg-gray-800"><Link to="/about" className="block text-white text-center text-lg px-3 py-4">About</Link></li>
        <li className="float-right hover:bg-gray-800"><Link to="/login" className="block text-white text-center text-lg px-3 py-4">Login</Link></li>
      </ul>
      <div className="mx-2">
        <Outlet />
      </div>
    </>
  )
}