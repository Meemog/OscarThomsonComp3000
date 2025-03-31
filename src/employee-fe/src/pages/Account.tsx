import LoadCircle from "../elements/Loading"
import { ReactNode, useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import Cookies from "universal-cookie"

export default function Account(): ReactNode {
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
    const [pfpBox, setPfpBox] = useState(<br />)
    const [isInitialised, setInitialised] = useState(false)

    useEffect(() => {
        if (!isInitialised){
            const url = window.location
            setPfpBox(
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="flex flex-col items-left justify-center">
                        <p className="block text-sm font-medium text-gray-700" >Profile Picture:</p>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                        <div className="border-solid border-2 rounded-full w-32 h-32 relative group">
                            <img className="rounded-full" src={`http://${url.hostname}/images/${profilePicture}`} />
                            <button className="absolute bottom-1 right-10 bg-slate-300 opacity-75 px-2 py-0 mt-1 text-justify rounded hidden group-hover:block" onClick={()=>{setPfpBox(<ImageUpload resetFunc={resetPfpBox} username={username}/>)}}>Edit</button>
                        </div>
                    </div>
                </div>
            )
            setInitialised(true)
        }
    })

    async function resetPfpBox() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        const data = await fetch(`http://${url.hostname}/api/getAccount/${username}`, {
            method: "GET",
            headers: {
                "Authorization": token
            }
        })
        if (data.status === 200){
            data.json().then((jData => {
                const currentPfpBox = 
                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className="flex flex-col items-left justify-center">
                            <p className="block text-sm font-medium text-gray-700" >Profile Picture:</p>
                        </div>
                        <div className="col-span-2 flex items-center justify-center">
                            <div className="border-solid border-2 rounded-full w-32 h-32 relative group">
                                <img className="rounded-full" src={`http://${url.hostname}/images/${jData.profilePicture}`} />
                                <button className="absolute bottom-1 right-10 bg-slate-300 opacity-75 px-2 py-0 mt-1 text-justify rounded hidden group-hover:block" onClick={()=>{setPfpBox(<ImageUpload resetFunc={resetPfpBox} username={username}/>)}}>Edit</button>
                            </div>
                        </div>
                    </div>
                setPfpBox(currentPfpBox)
            }))
        }
    }
    

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
    const otherNamesString = otherNames.join(", ")
    return(
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center pt-8">{username} </h1>
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
                {pfpBox}
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
                    <p className="mt-1 p-2 w-full rounded border-solid border-2 border-gray-700">{contractedHours.toString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="payRate">Pay Per Hour</label>
                        <p className="mt-1 p-2 w-full rounded border-solid border-2 border-gray-700">{payRate.toString()}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700" htmlFor="overtimePayRate">Overtime Pay Per Hour</label>
                        <p className="mt-1 p-2 w-full rounded border-solid border-2 border-gray-700">{overtimePayRate.toString()}</p>
                    </div>
                </div>
                <div className="flex justify-center mt-2">
                    <button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={submit}>Update Account</button>
                </div>
            </div>
            <div className="flex justify-center mt-2">
                <Link to='/'><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded">Back</button></Link>
            </div>
            {errorBox}
        </div>
    )
}

type ImageUploadProps = {
    resetFunc: () => void,
    username: string
}

function ImageUpload({resetFunc, username}: ImageUploadProps): ReactNode {
    const [errorBox, setErrors] = useState(<br />)
    function submit() {
        const dataInput = document.getElementById("image")!

        const validatedInput = (dataInput as HTMLInputElement).files![0]
        if (!validatedInput){
            alert("Please select a file")
            return
        }

        const data = new FormData()
        data.append('picture', validatedInput)

        const cookies = new Cookies()
        const token = cookies.get("Token")

        const url = window.location
        fetch(`http://${url.hostname}/api/setPfp/${username}`,{
            method: 'POST',
            headers:{
                "Authorization": token
            },
            body: data
        })
            .then((response: Response) => {
                if (response.ok){
                    resetFunc()
                } else {
                    response.json().then(data => {
                        setErrors(
                            <div className="bg-red-300 p-2 mt-2 mb-2 rounded">
                                <p className="text-center">{data.error}</p>
                            </div>
                        )
                    })
                }
            })
    }
    return(
        <div className="border-solid border-2 rounded p-2 my-2">
            <p className="text-lg text-center">New Profile Picture:</p>
            <div className="flex items-center justify-center pt-2">
                <input id="image" type="file" accept="image/png" />
            </div>
            <div className="flex justify-center pt-2">
                <button className="h-7 w-32 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2" onClick={resetFunc}>Cancel</button>
                <button className="h-7 w-32 bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={submit}>Upload</button>
            </div>
            {errorBox}
        </div>
    )
}