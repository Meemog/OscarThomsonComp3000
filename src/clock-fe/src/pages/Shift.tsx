import { ReactNode, useEffect, useState } from "react";
import LoadCircle from "../elements/Loading";
import Cookies from "universal-cookie";

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
        console.log(data.state)
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
                    setContent(<UnclockedShift startTime={data.shift.startTime} endTime={data.shift.endTime} breakDur={data.shift.breakDuration}/>)
                })
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

function UnclockedShift({startTime, endTime, breakDur}: {startTime: number, endTime: number, breakDur: number}): ReactNode {
    const start = new Date(startTime).getHours() + ":" + new Date(startTime * 1000).getMinutes()
    const end = new Date(endTime).getHours() + ":" + new Date(endTime * 1000).getMinutes()
    console.log(startTime, endTime, breakDur)

    function formatBreakDuration(breakDur: number): string {
        if (breakDur === 0) return "No break"
        const hours = Math.floor(breakDur / 3600)
        const minutes = Math.floor((breakDur % 3600) / 60)
        return `${hours}h ${minutes}m`
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
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={() => {}}>Cancel</button>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-2" onClick={() => {}}>Clock In</button>
            </div>
        </div>
    )
}

function ClockedShift(): ReactNode {
    return (
        <div className="mx-auto w-full max-w-md mt-3">
            <h1 className="text-2xl text-center">Shift</h1>
            <div className="bg-green-400 p-2 rounded">
                <h1 className="text-xl text-center">You are in a shift</h1>
            </div>
        </div>
    )
}