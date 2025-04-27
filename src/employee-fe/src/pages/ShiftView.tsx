import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import Cookies from "universal-cookie";

export default function ShiftView() {
    const params = useParams()
    const [shift, setShift] = useState(<Shifts shifts={[]} />)
    const [hasData, setHasData] = useState(false)

    const username = params.username!
    const date = params.date!
    const year = date.slice(0, 4)
    const month = date.slice(4, 6)
    const day = date.slice(6, 8)

    useEffect(() => {
        if (!hasData){
            setHasData(true)

            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")
            fetch(`http://${url.hostname}/api/schedule/${username}/${year}/${month}/${day}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            }).then((response) => {
                if (response.ok){
                    response.json().then((data) => {
                        const shifts = data.shifts
                        const formattedShifts: Array<shiftType> = []
                        for (let i=0; i<shifts.length; i++){
                            const startTime = shifts[i].startTime
                            const endTime = shifts[i].endTime
                            const breakDuration = shifts[i].breakDuration
                            const id = shifts[i]._id
                            formattedShifts.push({
                                startTime: startTime,
                                endTime: endTime,
                                breakDuration: breakDuration,
                                id: id
                            })
                        }
                        setShift(<Shifts shifts={formattedShifts} />)
                    })
                }
            })
        }
    }, [hasData, username, year, month, day])

    return(
        <div className="mx-auto w-full max-w-md">
            <p className="text-2xl text-center">Schedule for: {username} for {day}/{month}/{year}</p>
            {shift}
            <div className="flex justify-center">
                <Link to={`/timetable/${username}`}><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2">Back</button></Link>
            </div>
        </div>
    )
}

type shiftType = {
    startTime: number,
    endTime: number,
    breakDuration: number,
    id: string
}

type shiftProps = {
    shifts: Array<shiftType>
}

function Shifts({shifts}: shiftProps) {
    const shiftList = sort(shifts)

    function sort(items: Array<shiftType>) {
        items.sort((a, b) => {
            return a.startTime - b.startTime
        })
        return items
    }
    
    function formatShifts(shifts: Array<shiftType>) {
        const shiftList = []
        for (let i=0; i<shifts.length; i++){
            shiftList.push(<Shift startTime={shifts[i].startTime} endTime={shifts[i].endTime} breakDuration={shifts[i].breakDuration} id={shifts[i].id}/>)
        }
        return shiftList
    }

    return(
        <>
        <div className="grid grid-cols-4 gap-4 mt-4 mb-4">
            <p className="text-lg text-center">Start</p>
            <p className="text-lg text-center">End</p>
            <p className="text-lg text-center">Break</p>
            <p className="text-lg text-center">Time</p>
        </div>
        {formatShifts(shiftList)}
        </>
    )
}

function Shift({startTime, endTime, breakDuration}: shiftType) {

    return(
        <div className="grid grid-cols-4 gap-4 mt-4 mb-4">
                <p className="text-lg text-center">{new Date(startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-lg text-center">{new Date(endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                <p className="text-lg text-center">{Math.floor(breakDuration/60)} min</p>
                <p className="text-lg text-center">{Math.floor((endTime-startTime)/(60*60*1000))}h {((endTime-startTime)/(60*1000))%60}m</p>
        </div>
        )
}