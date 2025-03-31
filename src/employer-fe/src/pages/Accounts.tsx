import { ReactNode, useEffect, useState } from "react";
import { Link } from "react-router";
import Cookies from "universal-cookie";
import LoadCircle from "../elements/Loading";

export default function Accounts(): ReactNode {
    return (
        <div className="mx-auto w-full max-w-lg">
            <h1 className="text-2xl text-center my-2">Accounts</h1>
            <AccountList />
            <div className="flex justify-center">
                <Link to="/home"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2">Back</button></Link>
                <Link to="/new-account"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded ml-2">+ Add New Account</button></Link>
            </div>
        </div>
    )
}

function AccountList(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        if (!hasData){
            getAccounts().then(data => {
                const users = formatUsers(data)
                setContent(
                    <>
                    <div className="grid grid-cols-9 py-2 my-1 px-1">
                        <p className="text-center text-lg">pfp</p>
                        <p className="text-center text-lg col-span-2">Username</p>
                        <p className="text-center text-lg">Type</p>
                        <p className="text-center text-lg col-span-2">Name</p>
                        <p className="text-center text-lg">Pay</p>
                        <p className="text-center text-lg">OT Pay</p>
                        <br />
                    </div>
                    {users}
                    </>
                )
            })
            setHasData(true)
        }
    })

    function formatUsers(data) {
        const users = []
        for (let i = 0; i < data.length; i++){
            users.push(<Account pfp={data[i].profilePicture} username={data[i].username} type={data[i].accountType} name={data[i].firstName + " " + data[i].lastName} pay={data[i].payRate} otPay={data[i].overtimePayRate}/>)
        }
        return users
    }

    async function getAccounts() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        const data = await fetch(`http://${url.hostname}/api/getAccounts`, {
            method: "GET",
            headers: {
                "Authorization": token
            }
        })

        return await data.json()
    }
    return (
        <>
        {content}
        </>
    )
}

type AccountProps = {
    pfp: string,
    username: string,
    type: string,
    name: string,
    pay: number,
    otPay: number
}

function Account({pfp, username, type, name, pay, otPay}: AccountProps): ReactNode {

    async function remove() {

        if (!window.confirm(`Are you sure you want to remove ${username}?`)){
            return
        }

        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        const data = await fetch(`http://${url.hostname}/api/deleteAccount/${username}`, {
            method: "DELETE",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
        })

        if (data.ok){
            window.location.reload()
        }
    }

    const url = window.location
    return (
        <div className="grid grid-cols-9 py-2 my-1 px-1 border-2 border-gray-600 rounded">
            <Link to= {`/accounts/${username}`} className="grid grid-cols-8 col-span-8">
                <img src={`http://${url.hostname}/images/${pfp}`} className="col-span-1"/>
                <p className="text-center col-span-2">{username}</p>
                <p className="text-center">{type}</p>
                <p className="text-center col-span-2">{name}</p>
                <p className="text-center">{pay}</p>
                <p className="text-center">{otPay}</p>
            </Link>
            <div className="flex justify-center">
                <button className="bg-red-500 hover:bg-red-700 text-white px-4 pb-1 rounded" onClick={remove}>X</button>
            </div>
        </div>
    )
}