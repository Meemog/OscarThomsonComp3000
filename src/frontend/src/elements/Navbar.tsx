import { Outlet, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <ul className="navbar">
        <li><Link to="/" className="navbar">Home</Link></li>
        <li><Link to="/about" className="navbar">About</Link></li>
        <li><Link to="/database" className="navbar">Database</Link></li>
        <li className="login"><Link to="/login" className="navbar">Login</Link></li>
      </ul>
      <div className="mx-2">
        <Outlet />
      </div>
    </>
  )
}