import { Outlet, Link } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <ul className="navbar">
        <li><Link to="/" className="navbar">Home</Link></li>
        <li><Link to="/about" className="navbar">About</Link></li>
        <li><Link to="/database" className="navbar">Database</Link></li>
      </ul>
      <div className="main">
        <Outlet />
      </div>
    </>
  )
}