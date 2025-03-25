import { Link, useParams } from "react-router"
import LoadCircle from "../elements/Loading"
import { ReactNode, useEffect, useState } from "react"
import Cookies from "universal-cookie"

export default function EditAccount(): ReactNode {
    const params = useParams()
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        if (!hasData){
            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")
            fetch(`http://${url.hostname}/api/getAccount/${params.username}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            })
                .then(data => {
                    if (data.status === 200){
                        data.json()
                            .then(data => {
                                setContent(<AccountForm username={data.username} firstName={data.firstName} lastName={data.lastName} otherNames={data.otherNames} email={data.email} phone={data.phoneNumber} payRate={data.payRate} overtimePayRate={data.overtimePayRate} profilePicture={data.profilePicture} contractedHours={data.contractedHours}/>)
                                setHasData(true)
                            })
                    } else if (data.status === 401){
                        setContent(
                            <div className="mx-auto w-full max-w-md mt-3">
                                <div className="bg-red-400 p-2 rounded">
                                    <h1 className="text-xl text-center">401 Unauthorized</h1>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <Link to="/home"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded">Back</button></Link>
                                </div>
                            </div>
                        )
                    } else if (data.status === 404){
                        setContent(
                            <div className="mx-auto w-full max-w-md mt-3">
                                <div className="bg-red-400 p-2 rounded">
                                    <h1 className="text-xl text-center">401 File Not Found</h1>
                                </div>
                                <div className="flex justify-center mt-2">
                                    <Link to="/home"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded">Back</button></Link>
                                </div>
                            </div>
                        )
                    }
            })
        }
    })

    return(
        <>
        {content}
        </>
    )
}

type AccountFormProps = {
    username: string,
    firstName: string,
    lastName: string,
    otherNames: Array<string>,
    email: string,
    phone: string,
    payRate: number,
    overtimePayRate: number,
    profilePicture: string,
    contractedHours: number
}

function AccountForm({username, firstName, lastName, otherNames, email, phone, payRate, overtimePayRate, profilePicture, contractedHours}: AccountFormProps): ReactNode {
    const [errorBox, setErrors] = useState(<br />)

    function errorFormat(errors: Array<string>): Array<ReactNode> {
        const elements = [<p>Please Fix the Following Errors:</p>]
        for (let i=0; i<errors.length; i++){
            elements.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return elements
    }
    function getData() {
        const firstName = (document.getElementById("firstName") as HTMLInputElement).value
        const lastName = (document.getElementById("lastName") as HTMLInputElement).value
        const otherNames = (document.getElementById("otherNames") as HTMLInputElement).value
        const email = (document.getElementById("email") as HTMLInputElement).value
        const phone = (document.getElementById("phoneNumber") as HTMLInputElement).value
        const contractedHours = (document.getElementById("contractedHours") as HTMLInputElement).value
        const payRate = (document.getElementById("payRate") as HTMLInputElement).value
        const overtimePayRate = (document.getElementById("overtimePayRate") as HTMLInputElement).value

        const errors = []
        const obj: {
            firstName?: string,
            lastName?: string,
            otherNames?: Array<string>,
            email?: string,
            phone?: string,
            contractedHours?: number,
            payRate?: number,
            overtimePayRate?: number,
            accountType?: string
         } = {}


        if (firstName){
            obj.firstName = firstName
            if (!/^[a-zA-Z'-]+$/.test(firstName)){
                errors.push("First name can only contain alphabetical characters, hyphens, and apostrophes");
            }
        }
        if (lastName){
            obj.lastName = lastName
            if (!/^[a-zA-Z'-]+$/.test(lastName)){
                errors.push("Last name can only contain alphabetical characters, hyphens, and apostrophes");
            }
        }
        if (otherNames){
            obj.otherNames = otherNames.split(", ")
            for (let i = 0; i < obj.otherNames.length; i++){
                if (!/^[a-zA-Z'-]+$/.test(obj.otherNames[i])){
                    errors.push("Other names can only contain alphabetical characters, hyphens, and apostrophes");
                }
            }
        }
        if (email){
            obj.email = email
        }
        if (phone){
            obj.phone = phone
            if (!/^[0-9]+$/.test(phone)){
                errors.push("Phone number can only contain numbers")
            }
        }
        if (contractedHours){
            obj.contractedHours = parseInt(contractedHours)
            if (isNaN(obj.contractedHours)){
                errors.push("Contracted hours must be a number")
            }
        }
        if (payRate){
            obj.payRate = parseInt(payRate)
            if (isNaN(obj.payRate)){
                errors.push("Pay rate must be a number")
            }
        }
        if (overtimePayRate){
            obj.overtimePayRate = parseInt(overtimePayRate)
            if (isNaN(obj.overtimePayRate)){
                errors.push("Overtime pay rate must be a number")
            }
        }

        if (errors.length > 0){
            setErrors(<div className="bg-red-300 p-2 mt-2 mb-10 rounded">{errorFormat(errors)}</div>)
            return {
                data: null,
                valid: false
            }
        } else {
            return {
                data: obj,
                valid: true
            }
        }
    }

    function submit() {
        const data = getData()
        if (data.valid){
            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")
            fetch(`http://${url.hostname}/api/updateAccount/${username}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(data.data)
            })
            .then(data => {
                if (data.status === 200){
                    window.location.href = `http://${url.hostname}:${url.port}/accounts/${username}`
                } else if (data.status === 401){
                    setErrors(
                        <div className="bg-red-300 p-2 mt-2 mb-10 rounded">
                            <p>401 Unauthorized</p>
                        </div>
                    )
                } else if (data.status === 404){
                    setErrors(
                        <div className="bg-red-300 p-2 mt-2 mb-10 rounded">
                            <p>404 File Not Found</p>
                        </div>
                    )
                } else if (data.status === 400){
                    setErrors(
                        <div className="bg-red-300 p-2 mt-2 mb-10 rounded">
                            <p>400 Bad Request</p>
                        </div>
                    )
                }
            })
        }
    }
    const url = window.location
    const otherNamesString = otherNames.join(", ")
    return(
        <div className="mx-auto w-full max-w-md">
            <div className="grid grid-cols-6">
                <div className="col-span-5">
                    <h1 className="text-2xl text-center pt-8">Edit Account: {username} </h1>
                </div>
                <div className="pt-2">
                    <img src={`http://${url.hostname}/images/${profilePicture}`}></img>
                </div>
            </div>
            <div className="p-6 border-solid border-2 rounded">
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
                    <input placeholder={firstName} type="text" id="firstName" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
                    <input placeholder={lastName} type="text" id="lastName" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="otherNames">Other Names (Separated with a comma)</label>
                    <input placeholder={otherNamesString} type="text" id="otherNames" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                    <input placeholder={email} type="email" id="email" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="phoneNumber">Phone Number</label>
                    <input placeholder={phone} type="number" id="phoneNumber" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700" htmlFor="contractedHours">Contracted Hours</label>
                    <input placeholder={contractedHours.toString()} type="number" id="contractedHours" className="mt-1 p-2 w-full rounded border-solid border-2" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="payRate">Pay Per Hour</label>
                        <input placeholder={payRate.toString()} type="number" id="payRate" className="mt-1 p-2 w-full rounded border-solid border-2" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="overtimePayRate">Overtime Pay Per Hour</label>
                        <input placeholder={overtimePayRate.toString()} type="number" id="overtimePayRate" className="mt-1 p-2 w-full rounded border-solid border-2" />
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={submit}>Update Account</button>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <Link to='/accounts'><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded">Back</button></Link>
            </div>
            {errorBox}
        </div>
    )
}