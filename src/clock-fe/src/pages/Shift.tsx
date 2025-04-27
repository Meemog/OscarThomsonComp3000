import { ReactNode, useEffect, useState } from "react";
import LoadCircle from "../elements/Loading";
import Cookies from "universal-cookie";
import { Link } from "react-router-dom";

export default function Shift({tempToken}: {tempToken: string}): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)

    useEffect(() => {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        // check if user is in a shift
        fetch(`http://${url.hostname}/api/clock/state`, {
            method: "GET",
            headers: {
                "Authorization": token,
                "UserToken": tempToken,
            }
        }).then((response) => {
            if (response.status === 200){
                response.json().then((data) => {
                    if (data.state === "none") {
                        manageNotInShift()
                    } else {
                        manageInShift(data)
                    }
                })
            }
        })

    }, [])

    function manageInShift(data) {
        if (data.state === "in") {
            let breakDuration = data.scheduled.breakDuration
            if(data.actualShift.breakEnd) {
                breakDuration = 0
            }
            setContent(<ClockedShift timeStarted={data.actualShift.startTime} endTime={data.scheduled.endTime} shiftId={data.actualShift._id} breakDuration={breakDuration} userToken={tempToken} />)
        } else if (data.state === "break") {
            let breakDuration = data.scheduled.breakDuration
            setContent(<BreakShift timeStarted={data.actualShift.startTime} endTime={data.scheduled.endTime} shiftId={data.actualShift._id} breakLeft={breakDuration} userToken={tempToken} />)
        }

        return
    }

    function manageNotInShift() {
        // check if the user should be in a shift
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/shift`, {
            method: "GET",
            headers: {
                "Authorization": token,
                "UserToken": tempToken,
            }
        })
        .then((response) => {
            if (response.status === 200){
                response.json().then((data) => {
                    console.log(data)
                    setContent(<UnclockedShift startTime={data.shift.startTime} endTime={data.shift.endTime} breakDur={data.shift.breakDuration} shiftId={data.shift._id} userToken={tempToken}/>)
                })
            } else if (response.status === 204) {
                setContent(
                    <div className="mx-auto w-full max-w-md mt-3">
                        <div className="p-2">
                            <h1 className="text-xl text-center">No shift found</h1>
                            <div className="flex justify-center mt-3">
                                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={()=>{window.location.reload()}}>back</button>
                            </div>
                        </div>
                    </div>
                )
            } else {
                setContent(
                    <div className="mx-auto w-full max-w-md mt-3">
                        <div className="bg-red-400 p-2 rounded">
                            <h1 className="text-xl text-center">Error: {response.status}</h1>
                        </div>
                    </div>
                )
            }
        })
        return
    }

    return content
}

function UnclockedShift({startTime, endTime, breakDur, shiftId, userToken}: {startTime: number, endTime: number, breakDur: number, shiftId: string, userToken: string}): ReactNode {
    const start = new Date(startTime).getHours() + ":" + new Date(startTime).getMinutes()
    const end = new Date(endTime).getHours() + ":" + new Date(endTime).getMinutes()
    console.log(startTime, endTime, breakDur)

    function formatBreakDuration(breakDur: number): string {
        if (breakDur === 0) return "No break"
        const hours = Math.floor(breakDur / 3600)
        const minutes = Math.floor((breakDur % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    function clockIn() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/clockIn`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "UserToken": userToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shiftId: shiftId,
            })
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const scheduledtime = Math.floor(data.scheduled.startTime / 60000)
                    const actualtime = Math.floor(data.actualShift.startTime / 60000)
                    if (actualtime > scheduledtime) {
                        alert(`You clocked in ${actualtime - scheduledtime} minutes late`)
                    } else if (actualtime < scheduledtime) {
                        alert(`You clocked in ${scheduledtime - actualtime} minutes early`)
                    } else {
                        alert("You clocked in on time")
                    }
                    window.location.reload()
                })
            }
        })
    }

    return (
        <div className="mx-auto w-full max-w-md mt-3">
            <h1 className="text-2xl text-center">Shift</h1>
            <div className="grid grid-cols-3 gap-4 mt-3">
                <p className="text-center">Start Time</p>
                <p className="text-center">End Time</p>
                <p className="text-center">Break Duration</p>
                {startTime > new Date().getTime() ? <p className="text-center">{start}</p> : <p className="text-center bg-red-400 rounded">{start}</p>}
                <p className="text-center">{end}</p>
                <p className="text-center">{formatBreakDuration(breakDur)}</p>
            </div>
            <div className="flex justify-center mt-3">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={() => {window.location.reload()}}>Cancel</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={clockIn}>Clock In</button>
            </div>
        </div>
    )
}

function ClockedShift({timeStarted, endTime, shiftId, breakDuration, userToken}: {timeStarted: number, endTime: number, shiftId: string, breakDuration: number, userToken: string}): ReactNode {
    const start = new Date(timeStarted).getHours() + ":" + new Date(timeStarted).getMinutes()
    const end = new Date(endTime).getHours() + ":" + new Date(endTime).getMinutes()

    function formatBreakDuration(breakDur: number): string {
        if (breakDur === 0) return "No break"
        const hours = Math.floor(breakDur / 3600)
        const minutes = Math.floor((breakDur % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    function clockOut() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/clockOut`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "UserToken": userToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shiftId: shiftId,
            })
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const scheduledtime = Math.floor(data.scheduled.endTime / 60000)
                    const actualtime = Math.floor(data.actualShift.endTime / 60000)
                    alert(`You clocked out ${Math.abs(actualtime - scheduledtime)} minutes ${actualtime > scheduledtime ? "late" : "early"}`)
                    window.location.reload()
                })
            }
        })
    }

    function takeBreak() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/startBreak`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "UserToken": userToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shiftId: shiftId,
            })
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    alert("You are on break")
                    window.location.reload()
                })
            }
        })
    }


    return (
        <div className="mx-auto w-full max-w-md mt-3">
            <h1 className="text-2xl text-center">Shift</h1>
            <div className="grid grid-cols-3 gap-4 mt-3">
                <p className="text-center">Time Started</p>
                <p className="text-center">End Time</p>
                <p className="text-center">Break Left</p>
                <p className="text-center">{start}</p>
                <p className="text-center">{end}</p>
                <p className="text-center">{formatBreakDuration(breakDuration)}</p>
            </div>
            <div className="flex justify-center mt-3">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={() => {window.location.reload()}}>Cancel</button>
                {breakDuration != 0 ? <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={takeBreak}>Take Break</button> : <></>}
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={clockOut}>Clock Out</button>
            </div>
        </div>
    )
}

function BreakShift({timeStarted, endTime, shiftId, breakLeft, userToken}: {timeStarted: number, endTime: number, shiftId: string, breakLeft: number, userToken: string}): ReactNode {
    const start = new Date(timeStarted).getHours() + ":" + new Date(timeStarted).getMinutes()
    const end = new Date(endTime).getHours() + ":" + new Date(endTime).getMinutes()

    function formatBreakDuration(breakDur: number): string {
        const hours = Math.floor(breakDur / 3600)
        const minutes = Math.floor((breakDur % 3600) / 60)
        return `${hours}h ${minutes}m`
    }

    function clockOut() {
        returnFromBreak()
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/clockOut`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "UserToken": userToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shiftId: shiftId,
            })
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    const scheduledtime = Math.floor(data.scheduled.endTime / 60000)
                    const actualtime = Math.floor(data.actualShift.endTime / 60000)
                    alert(`You clocked out ${Math.abs(actualtime - scheduledtime)} minutes ${actualtime > scheduledtime ? "late" : "early"}`)
                    window.location.reload()
                })
            }
        })
    }

    function returnFromBreak() {
        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/clock/endBreak`, {
            method: "POST",
            headers: {
                "Authorization": token,
                "UserToken": userToken,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                shiftId: shiftId,
            })
        }).then((response) => {
            if (response.status === 200) {
                response.json().then((data) => {
                    alert("You are back from break")
                    window.location.reload()
                })
            }
        })
    }

    return (
        <div className="mx-auto w-full max-w-md mt-3">
            <h1 className="text-2xl text-center">Shift</h1>
            <div className="grid grid-cols-3 gap-4 mt-3">
                <p className="text-center">Time Started</p>
                <p className="text-center">End Time</p>
                <p className="text-center">Break Left</p>
                <p className="text-center">{start}</p>
                <p className="text-center">{end}</p>
                <p className="text-center">{formatBreakDuration(breakLeft)}</p>
            </div>
            <div className="flex justify-center mt-3">
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={() => {window.location.reload()}}>Cancel</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={returnFromBreak}>Return from Break</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={clockOut}>Clock Out</button>
            </div>
        </div>
    )
}