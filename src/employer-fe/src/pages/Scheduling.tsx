import { ReactNode, useEffect, useState } from "react"
import LoadCircle from "../elements/Loading"
import Cookies from "universal-cookie"
import { Link } from "react-router"

export default function Scheduling(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        if (!hasData){
            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")

            fetch(`http://${url.hostname}/api/getAccounts`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            }).then((response) => {
                if (response.ok){
                    return response.json()
                } else {
                    setContent(
                        <div className="mx-auto w-full max-w-md">
                            <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                                <p className="text-center">Error: {response.status}</p>
                            </div>
                        </div>
                    )
                }
            }).then((data) => {
                if (data){
                    const users = formatUsers(data)
                    setContent(
                        <div className="mx-auto w-full max-w-lg">
                            <h1 className="text-2xl text-center my-2">Accounts</h1>
                            <UserList data={users}/>
                            <div className="flex justify-center">
                                <Link to="/home"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2">Back</button></Link>
                            </div>
                        </div>
                    )
                }
            }).finally(() => {
                setHasData(true)
            })

        }
    }, [hasData])

    function formatUsers(data): Array<dataInt> {
        const users = []

        for (let i = 0; i < data.length; i++){
            users.push({
                username: data[i].username,
                accountType: data[i].accountType,
                pfp: data[i].profilePicture,
                name: data[i].firstName + " " + data[i].lastName,
                contractedHours: data[i].contractedHours
            })
        }
        return users
    }

    return content
}

type dataInt = {
    username: string,
    accountType: string,
    pfp: string,
    name: string,
    contractedHours: number
}

type UserListProps = {
    data: Array<dataInt>
}

function UserList({data}: UserListProps): ReactNode {
    function formatUsers(data: Array<dataInt>) {
        const users = []
        for (let i = 0; i < data.length; i++){
            if (data[i].accountType === "staff"){
                console.log(data[i])
                users.push(
                    <User pfp={data[i].pfp} username={data[i].username} accountType={data[i].accountType} name={data[i].name} contractedHours={data[i].contractedHours}/>
                )
            }
        }
        return users
    }

    return (
        <>
        <div className="grid grid-cols-6 py-2 my-1 px-1">
            <br />
            <div className="flex items-center justify-center col-span-2">
                <p className="text-center text-lg">Username</p>
            </div>
            <div className="flex items-center justify-center col-span-2">
                <p className="text-center text-lg">Full Name</p>
            </div>
            <div className="flex items-center justify-center">
                <p className="text-center text-lg">Hours</p>
            </div>
        </div>
        {formatUsers(data)}
        </>
    )
}

function User({pfp, username, name, contractedHours}: dataInt): ReactNode {
    const url = window.location
    return (
        <Link to={`/scheduling/${username}`}>
            <div className="grid grid-cols-6 py-2 my-1 px-1 border rounded hover:shadow-lg hover:bg-gray-100">
                <div className="flex items-center justify-center">
                    <div className="border-solid border-2 rounded-full w-12 h-12">
                        <img className="rounded-full" src={`http://${url.hostname}/images/${pfp}`} />
                    </div>
                </div>
                <div className="flex items-center justify-center col-span-2">
                    <p className="text-center text-lg">{username}</p>
                </div>
                <div className="flex items-center justify-center col-span-2">
                    <p className="text-center text-lg">{name}</p>
                </div>
                <div className="flex items-center justify-center">
                    <p className="text-center text-lg">{contractedHours}</p>
                </div>
            </div>
        </Link>
    )
}