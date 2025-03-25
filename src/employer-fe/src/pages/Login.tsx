import { sha256 } from "js-sha256"
import { ReactNode, useEffect, useState } from "react"

import Cookies from "universal-cookie"
import PassBox from "../elements/Passbox"
import LoadCircle from "../elements/Loading"
import { authenticate } from "../scripts/auth"

interface contentInt {
    username: string,
    password: string
}

interface dataInt {
    data: contentInt | null,
    valid: boolean
}


export default function Login(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [isAuth, setAuth] = useState(true)

    useEffect(() => {
        if (isAuth){
            const auth = authenticate()

            auth.then((data) => {
                if(data.loggedIn){
                    if(data.data!.type === "admin"){
                        const url = window.location
                        window.location.replace(`http://${url.hostname}:${url.port}/home`)
                    }
                }
                setContent(<LoginPage />)
                setAuth(false)
            })
        }
    }, [isAuth])

    return content
}

function LoginPage(): ReactNode {
    const [errorBox, setErrors] = useState(<br />)

    function errorFormat(errors: Array<string>): Array<ReactNode> {
        const elements = [<p>Please Fix the Following Errors:</p>]
        for (let i=0; i<errors.length; i++){
            elements.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return elements
    }

    function getData(): dataInt {
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

        let toReturn: dataInt

        if (errors.length === 0){
            toReturn = {
                data: {
                    username: username,
                    password: sha256(password)
                },
                valid: true
            }
        } else {
            toReturn = {
                data: null,
                valid: false
            }
            setErrors(
                <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                    {errorFormat(errors)}
                </div>
            )
        }

        return toReturn
    }

    function submit() {
        const data = getData()
        console.log(data)
        if (data.valid){
            const url = window.location
            fetch(`http://${url.hostname}/api/login`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data.data)
            })
                .then((response: Response) => {
                    if (response.status != 200){
                        response.json()
                            .then((data) => {
                                setErrors(
                                    <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                                        {data.error}
                                    </div>
                                )
                            })
                    } else {
                        response.json()
                            .then((data) => {
                                console.log(data)
                                const cookies = new Cookies()
                                cookies.set("Token", data.token, {expires:new Date(data.expiry)})
                                console.log(cookies.get("Token"))
                                window.location.replace(`http://${url.hostname}:${url.port}/home`)
                            })
                    }
                })
        }
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>){
        if (e.key == "Enter"){
            submit()
        }
    }

    return(
        <>
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center mb-2">Management Login</h1>
            <div className="p-6 border-solid border-2 grid grid-cols-2 rounded">
                <div>
                    <form className="space-y-3">

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="username">Username:</label>
                            </div>
                            <div>
                                <input id="username" className="border border-gray-300 rounded" name="username" type="text" onKeyDown={handleKeyDown}/>
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="password">Password:</label>
                            </div>
                            <PassBox passId="password" inputHandler={handleKeyDown}/>
                        </div>

                        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" onClick={submit}>Submit</button>

                    </form>
                </div>
                <div className="pt-4 pl-6 pr-2 pb-2">
                    <img src="/lock.png" />
                </div>
            </div>
            {errorBox}
        </div>
        </>
    )

}