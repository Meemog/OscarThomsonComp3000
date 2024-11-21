import { Link } from "react-router-dom"
import { sha256 } from "js-sha256"
import { useState } from "react"

export default function Register() {
    const [errorBox, setErrors] = useState(<br />)
    function errorFormat(errors: Array<string>){
        const elements = [<p>Please Rectify the Following Errors</p>]
        for (let i=0; i<errors.length; i++){
            elements.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return elements
    }

    function getData() {
        const username = (document.getElementById("username")! as HTMLInputElement).value
        const email = (document.getElementById("email")! as HTMLInputElement).value
        const password = (document.getElementById("password")! as HTMLInputElement).value
        const confPassword = (document.getElementById("confPassword")! as HTMLInputElement).value

        const errors = [];
        if (username.length <= 3){
            errors.push("Username needs to be 4 or more characters long")
        }
        if (password != confPassword){
            errors.push("Passwords do not match")
        }
        if (password.length <= 3){
            errors.push("Password must be at least 4 characters")
        }
        if (password.length >=65){
            errors.push("Password length cannot exceed 64 characters")
        }

        let toReturn;

        if (errors.length > 0){
            toReturn = {
                data: null,
                valid: false
            }
            setErrors(
            <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                {errorFormat(errors)}
            </div>  
            )
        } else {
            const hashPassword = sha256(password)
            toReturn = {
                data: {
                    "username": username,
                    "email": email,
                    "password": hashPassword
                },
                valid: true
            }
        }
        return toReturn
   }

    function submit() {
        const data = getData()
        if (data.valid){
            const url = window.location
            fetch(`http://${url.hostname}/api/register`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data.data)
            })
        }
    }

    return(
        <>
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center mb-2">Register</h1>
            <div className="p-6 border-solid border-2 grid grid-cols-2 rounded">
                <div>
                    <form className="space-y-3">

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="username">Username:</label>
                            </div>
                            <div>
                                <input id="username" className="border border-gray-300 rounded" name="username" type="text" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="username">Email:</label>
                            </div>
                            <div>
                                <input id="email" className="border border-gray-300 rounded" name="username" type="text" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="password">Password:</label>
                            </div>
                            <div>
                                <input id="password" className="border border-gray-300 rounded" name="password" type="password" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="password">Confirm Password:</label>
                            </div>
                            <div>
                                <input id="confPassword" className="border border-gray-300 rounded" name="password" type="password" />
                            </div>
                        </div>

                        <button type="button" className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded" onClick={submit}>Submit</button>

                    </form>
                </div>
                <div className="flex">
                    <div className="content-center">
                        <div>
                            <p className="text-center">Already have an account?</p>
                            <div className="flex justify-center">
                                <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {errorBox}
        </div>
        </>
    )
}