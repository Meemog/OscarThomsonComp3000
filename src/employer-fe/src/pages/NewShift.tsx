import { ReactNode, useState } from "react"
import { Link, useParams } from "react-router"
import Cookies from "universal-cookie"

export default function NewShift(): ReactNode{
    const params = useParams()

    const [totalTime, setTotalTime] = useState(<></>)
    const [errorBox, setErrorBox] = useState(<></>)
    const [breakInput, setBreakInput] = useState(<></>)
    
    const username = params.username!
    const date = params.date!
    const year = date.slice(0, 4)
    const month = date.slice(4, 6)
    const day = date.slice(6, 8)

    function getData() {
        const startTime = (document.getElementById("start-time")! as HTMLInputElement).value
        const endTime = (document.getElementById("end-time")! as HTMLInputElement).value

        return [startTime, endTime]
    }

    function formatErrors(errors) {
        const tsxErrors = [<p>Please fix the following errors:</p>]
        for (let i=0; i<errors.length; i++){
            tsxErrors.push(<p className="pl-4">&#x2022;{errors[i]}</p>)
        }
        return (
            <div className="bg-red-300 p-2 mt-2 mb-10 rounded">{tsxErrors}</div>
        )
    }

    function submit() {
        const [startTime, endTime] = getData()

        const breakBoxBool = (document.getElementById("break")! as HTMLInputElement).checked

        let breakTime = null

        const errors = []

        if (!startTime) {
            errors.push("Please enter a start time")
        }

        if (!endTime) {
            errors.push("Please enter an end time")
        }

        if (breakBoxBool) {
            breakTime = (document.getElementById("break-time")! as HTMLInputElement).value
            if (!breakTime) {
                errors.push("Please add a break time, or uncheck the break option")
            }

            if (errors.length == 0) {
                const time = calculateTime(startTime, endTime)
                const breakMins = timeToMins(breakTime)

                if (breakMins >= time){
                    errors.push("Break time cannot be longer than shift time")
                }
            }
        }


        if (errors.length == 0) {
            setErrorBox(<></>)

            const startTimestamp = new Date(`${year}-${month}-${day}T${startTime}`).getTime()
            let endTimestamp = new Date(`${year}-${month}-${day}T${endTime}`).getTime()

            if (endTimestamp < startTimestamp){
                endTimestamp += 24*60*60*1000
            }

            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")
            fetch(`http://${url.hostname}/api/schedule/${params.username}`, {
                method: "POST",
                headers: {
                    "Authorization": token,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    start_time: startTimestamp,
                    end_time: endTimestamp,
                    break_time: breakBoxBool ? timeToMins(breakTime!)*60 : 0,
                })
            }).then((response) => {
                if (response.ok){
                    response.json().then((data) => {
                        alert("Shift Created")
                        window.location.href = `/scheduling/${username}/${date}`
                    })  
                }
                else {
                    setErrorBox(
                        <div className="mx-auto w-full max-w-md">
                            <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                                <p className="text-center">Error: {response.status}</p>
                            </div>
                        </div>
                    )
                }
            })
        } else {
            console.log(errors)
            setErrorBox(formatErrors(errors))
        }
    }

    function displayBreakBox() {
        const breakBoxBool = (document.getElementById("break")! as HTMLInputElement).checked

        if (breakBoxBool){
            setBreakInput(
                <div>
                    <label className="text-md block text-center">Break Time:</label>
                    <input type="time" id="break-time" name="break-time" className="border-2 border-gray-300 rounded p-2 mb-4 mx-auto block" onInput={displayHours}/>
                </div>
            )
        } else {
            setBreakInput(<></>)
        }

    }

    function displayHours() {
        const [startTime, endTime] = getData()

        if (startTime && endTime) {
            const totMins = calculateTime(startTime, endTime)

            const display = `${(totMins/60)}h ${totMins%60}m`

            // const display = `${(totMins/60).toString().length == 2 ? totMins/60 : `0${totMins/60}`}:${(totMins%60).toString().length == 2 ? totMins%60 : `0${totMins%60}`}`

            setTotalTime(<p className="text-center">This shift is {display} long</p>)

        } else {
            setTotalTime(<></>)
        }
    }
    function timeToMins(time: string) {
        const timeArr = time.split(':')
        return parseInt(timeArr[0]) * 60 + parseInt(timeArr[1])
    }


    function calculateTime(startTime: string, endTime: string) {
        const startMins = timeToMins(startTime)

        const endMins = timeToMins(endTime)

        const totMins = endMins > startMins ? endMins - startMins : endMins + 24*60 - startMins

        return totMins
    }

    return(
        <div className="mx-auto w-full max-w-lg">
            <p className="text-2xl text-center">Create New Shift for: {username} for {day}/{month}/{year}</p>
            <div className="p-6 border-solid border-2 rounded">
                <div>
                    <label className="text-md block text-center">Start Time:</label>
                    <input type="time" id="start-time" name="start-time" className="border-2 border-gray-300 rounded p-2 mb-4 mx-auto block" onInput={displayHours}/>
                </div>
                <div>
                    <label className="text-md block text-center">End Time:</label>
                    <input type="time" id="end-time" name="end-time" className="border-2 border-gray-300 rounded p-2 mb-4 mx-auto block" onInput={displayHours}/>
                </div>
                <div className="flex justify-center pb-2"><div>
                    <label className="text-md">Break: </label>
                    <input type="checkbox" id="break" name="break" onChange={displayBreakBox}/>
                </div></div>
                {breakInput}
                {totalTime}
                <button className="h-7 w-full bg-blue-500 hover:bg-blue-700 text-white rounded" onClick={submit}>Create Shift</button>
            </div>
            <div className="flex justify-center pt-2">
                <Link to={`/scheduling/${username}/${date}`}><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2">Back</button></Link>
            </div>
            {errorBox}
        </div>
    )
}