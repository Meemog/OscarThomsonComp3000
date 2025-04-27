import { ReactNode, useEffect, useState } from "react";
import { authenticate } from "../scripts/auth";
import LoadCircle from "../elements/Loading";
import Cookies from "universal-cookie";
import { Link } from "react-router";

export default function Home(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [isAuth, setAuth] = useState(false)

    useEffect(() => {
        if (!isAuth){
            const auth = authenticate()

            auth.then((data) => {
                const url = window.location
                if(data.loggedIn){
                    if(data.data!.type === "admin"){
                        setAuth(true)
                        setContent(<HomePage username={data.data!.username}/>)
                    }else{
                        window.location.replace(`http://${url.hostname}:${url.port}/home`)
                    }
                }else{
                    window.location.replace(`http://${url.hostname}:${url.port}/`)
                }
            })
        }
    }, [isAuth])

    return content
}

type HomePageProps = {
    username: string
}

function HomePage({username}: HomePageProps): ReactNode {
    function logOut(){
        if (confirm("Are you sure you want to log out?")) {
            const url = window.location
            const cookies = new Cookies()
            fetch(`http://${url.hostname}/api/logout`, {
                method: "POST",
                headers: {
                    "Authorization": cookies.get("Token")
                }
            }).then((response) => {
                if (response.ok){
                    cookies.remove("Token")
                    window.location.replace(`http://${url.hostname}:${url.port}/`)
                }else{
                    alert("Error logging out")
                }
            })
        }
    }

    return(
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center my-2">Welcome, {username}</h1>
            <div className="p-6 grid grid-cols-2 gap-2">
                <div>
                    <Link to="/accounts"><button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded">Manage Staff Accounts</button></Link>
                </div>
                <div>
                    <Link to="/scheduling"><button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded">Schedule shifts</button></Link>
                </div>
                <div>
                    <button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={logOut}>Log Out</button>
                </div>
            </div>
        </div>
    )
}