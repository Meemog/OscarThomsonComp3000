import { sha256 } from "js-sha256";
import { ReactNode, useState } from "react";
import { Link } from "react-router";
import Cookies from "universal-cookie";

export default function NewAccount(): ReactNode {
    const [errorBox, setErrors] = useState(<br />)

    function errorFormat(errors: Array<string>): Array<ReactNode> {
        const elements = [<p>Please Fix the Following Errors:</p>]
        for (let i=0; i<errors.length; i++){
            elements.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return elements
    }

    function getData(){
        const username = (document.getElementById("username")! as HTMLInputElement).value
        const password = (document.getElementById("password")! as HTMLInputElement).value
        const firstName = (document.getElementById("firstName")! as HTMLInputElement).value
        const lastName = (document.getElementById("lastName")! as HTMLInputElement).value
        const otherNames = (document.getElementById("otherNames")! as HTMLInputElement).value
        const email = (document.getElementById("email")! as HTMLInputElement).value
        const phoneNumber = (document.getElementById("phoneNumber")! as HTMLInputElement).value
        const contractedHours = (document.getElementById("contractedHours")! as HTMLInputElement).value
        const payRate = (document.getElementById("payRate")! as HTMLInputElement).value
        const overtimePayRate = (document.getElementById("overtimePayRate")! as HTMLInputElement).value
        const accountType = (document.getElementById("accountType")! as HTMLSelectElement).value

        //validate
        const errors: Array<string> = []

        const payRateNum = parseFloat(payRate)
        const overtimePayRateNum = parseFloat(overtimePayRate)
        const contractedHoursNum = parseInt(contractedHours)

        if (!username){
            errors.push("Please enter a username")
        }
        if(username.length < 4){
            errors.push("Username must be at least 4 characters long")
        }
        if (!password){
            errors.push("Please enter a password")
        }
        if (!firstName){
            errors.push("Please enter a first name")
            if (!/^[a-zA-Z'-]+$/.test(firstName)){
                errors.push("First name can only contain alphabetical characters, hyphens, and apostrophes");
            }
        }
        if (!lastName){
            errors.push("Please enter a last name")
            if (!/^[a-zA-Z'-]+$/.test(lastName)){
                errors.push("Last name can only contain alphabetical characters, hyphens, and apostrophes");
            }
        }
        if (!email){
            errors.push("Please enter an email")
        }
        if (!phoneNumber){
            errors.push("Please enter a phone number")
        }
        if (!contractedHours){
            errors.push("Please enter some contracted hours")
        } else if (contractedHoursNum < 0){
            errors.push("Contracted hours cannot be negative")
        }
        if (!payRate){
            errors.push("Please enter a pay rate")
        }else if (payRateNum < 0){
            errors.push("Pay rate cannot be negative")
        }
        if (!overtimePayRate){
            errors.push("Please enter an overtime pay rate")
        } else if (overtimePayRateNum < 0){
            errors.push("Overtime pay rate cannot be negative")
        }

        //process other names
        let otherNamesArr: Array<string> = []
        if (otherNames){
            try {
                otherNamesArr = otherNames.split(",").map(name => name.trim())
                if (!otherNamesArr.every(name => /^[a-zA-Z'-]+$/.test(name))) {
                    errors.push("Other names can only contain alphabetical characters, hyphens, and apostrophes");
                }
            } catch {
                errors.push("Please enter other names separated by commas")
            }
        }

        let toReturn

        if (errors.length === 0){
            setErrors(<br />)
            toReturn = {
                data: {
                    username: username,
                    password: sha256(password),
                    firstName: firstName,
                    lastName: lastName,
                    otherNames: otherNamesArr,
                    email: email,
                    phoneNumber: phoneNumber,
                    contractedHours: contractedHoursNum,
                    payRate: payRateNum,
                    overtimePayRate: overtimePayRateNum,
                    accountType: accountType
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

    function submit(){
        const data = getData()
        if (!data.valid){
            return
        }
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/createAccount`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token
            },
            body: JSON.stringify(data.data)
        }).then(res => {
            if (res.ok){
                alert("Account created successfully")
                window.location.reload()
            } else {
                res.json().then((data) => {
                    setErrors(
                        <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                            {errorFormat(data.error)}
                        </div>
                    )
                })
            }
        })
    }

    return (
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center my-2">Create Account</h1>
            <div className="p-6 border-solid border-2 rounded">
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
                    <input type="text" id="username" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
                    <input type="password" id="password" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
                    <input type="text" id="firstName" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
                    <input type="text" id="lastName" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="otherNames">Other Names (Separated with a comma)</label>
                    <input type="text" id="otherNames" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                    <input type="email" id="email" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="phoneNumber">Phone Number</label>
                    <input type="tel" id="phoneNumber" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="contractedHours">Contracted Hours</label>
                    <input type="number" id="contractedHours" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="payRate">Pay Per Hour</label>
                        <input type="number" id="payRate" className="mt-1 p-2 w-full rounded border-solid border-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="overtimePayRate">Overtime Pay Per Hour</label>
                        <input type="number" id="overtimePayRate" className="mt-1 p-2 w-full rounded border-solid border-2" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="accountType">Type</label>
                    <select id="accountType" className="mt-1 p-2 w-full rounded border-solid border-2">
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <div className="flex justify-center mt-2">
                    <button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={submit}>Create Account</button>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <Link to="/home"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded">Back</button></Link>
            </div>
            {errorBox}
        </div>
    )
}