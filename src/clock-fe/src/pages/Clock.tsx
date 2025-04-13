import {ReactNode, useEffect, useState } from "react"
import LoadCircle from "../elements/Loading"
import { authenticate } from "../scripts/auth"
import Cookies from "universal-cookie"
import { sha256 } from "js-sha256"
import Shift from "./Shift"

export default function Clock(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [isAuth, setAuth] = useState(true)

    useEffect(() => {
        if (isAuth){
            const auth = authenticate()

            auth.then((data) => {
                console.log(data)
                if(!data.loggedIn || data.data!.type !== "clock"){
                    const url = window.location
                    window.location.replace(`http://${url.hostname}:${url.port}/`)
                }
                setContent(<ClockPage setParentContent={(e: ReactNode) => {setContent(<>{e}</>)}}/>)
                setAuth(false)
            })
        }
    }, [isAuth])

    return content
}

function ClockPage({setParentContent}: {setParentContent: (e: ReactNode) => void}): ReactNode {
    const [errorBox, setErrors] = useState(<br />)

    function errorFormat(errors: Array<string>): Array<ReactNode> {
        const elements = [<p>Please Fix the Following Errors:</p>]
        for (let i=0; i<errors.length; i++){
            elements.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return elements
    }

    function submit() {
        const username = (document.getElementById("username")! as HTMLInputElement).value
        const password = (document.getElementById("password")! as HTMLInputElement).value

        //validate
        const errors: Array<string> = []

        if (!username){
            errors.push("Please enter a usename")
        }
        if (!password){
            errors.push("Please enter a password")
        }

        if (errors.length > 0){
            setErrors(<div className="p-6 mt-2 rounded bg-red-300 shadow-lg">{errorFormat(errors)}</div>)
            return
        }

        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")

        const data = {
            username: username,
            password: sha256(password)
        }
        fetch(`http://${url.hostname}/api/clock/login`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok){
                response.json().then((data) => {
                    console.log(data)
                    setParentContent(<Shift tempToken={data.token} />)
                })
            } else {
                response.json().then((data) => {
                    setErrors(<div className="p-6 mt-2 rounded bg-red-300 shadow-lg">error: {data.error}</div>)
                })
            }
        })
    }

    return (
        <div className="mx-auto w-full max-w-md mt-3">
            <h1 className="text-2xl text-center">Clock</h1>
            <div className="flex justify-center mt-3">
                <LiveClock />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                    <p>Username</p>
                    <input type="text" id="username" className="border-2 border-gray-300 rounded-md p-2 w-full" />
                </div>
                <div>
                    <p>Password</p>
                    <input type="password" id="password" className="border-2 border-gray-300 rounded-md p-2 w-full" />
                </div>
            </div>
            <div className="flex justify-center mt-3">
                <button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2" onClick={submit}>Get Shift</button>
            </div>
            {errorBox}
        </div>
    )
}

function LiveClock(): ReactNode {
    const [time, setTime] = useState(new Date().toLocaleTimeString())

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    return <h1 className="text-6xl text-bold text-center">{time}</h1>
}