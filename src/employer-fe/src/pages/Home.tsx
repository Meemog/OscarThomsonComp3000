import { ReactNode, useEffect, useState } from "react";
import { authenticate } from "../scripts/auth";
import LoadCircle from "../elements/Loading";
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
    return(
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center my-2">Welcome, {username}</h1>
            <div className="p-6 grid grid-cols-2 gap-2">
                <div>
                    <Link to="/accounts"><button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded">Manage Staff Accounts</button></Link>
                </div>
                <div>
                    <button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded">Schedule shifts</button>
                </div>
                <div>
                    <button className="h-44 w-full bg-blue-500 hover:bg-blue-700 text-white rounded">Other options</button>
                </div>
            </div>
        </div>
    )
}