import { ReactNode, use, useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import LoadCircle from "../elements/Loading";
import Cookies from "universal-cookie";

export default function ScheduleUser(): ReactNode {
    const [content, setContent] = useState(<LoadCircle size={8} offset={10}/>)
    const [hasData, setHasData] = useState(false)

    const params = useParams()

    useEffect(() => {
        if (!hasData){
            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")

            fetch(`http://${url.hostname}/api/schedule/${params.username}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            }).then((response) => {
                if (response.ok){
                    return response.json()
                }
                else {
                    setContent(
                        <div className="mx-auto w-full max-w-md">
                            <div className="p-6 mt-2 rounded bg-red-300 shadow-lg">
                                <p className="text-center">Error: {response.status}</p>
                            </div>
                        </div>
                    )
                }
            }).then((data) => {
                if (data){
                    setContent(<TimeTable username={params.username!} />)
                }
            }).finally(() => {
                setHasData(true)
            })
        }
    })

    return (
        <div className="mx-auto w-full max-w-2xl">
            <h1 className="text-2xl text-center mt-2 mb-6">Schedule For User: {params.username}</h1>
            {content}
            <div className="flex justify-center">
                <Link to="/scheduling"><button className="h-7 w-64 bg-blue-500 hover:bg-blue-700 text-white rounded mr-2">Back</button></Link>
            </div>
        </div>
    )
}

type timeTableProps = {
    username: string
}

function TimeTable({username}: timeTableProps): ReactNode {
    const date = new Date()
    const [month, setMonth] = useState(date.getMonth())
    const [year, setYear] = useState(date.getFullYear())
    const months = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const monthStr = months[month]
    const currentMonth = date.getMonth()

    const [monthCalendar, setMonthCalendar] = useState(<Calendar month={month} year={year} username={username} scheduledDays={[]}/>)
    const [hasData, setHasData] = useState(false)

    useEffect(() => {
        if (!hasData){
            setHasData(true)
            const url = window.location
            const cookies = new Cookies()
            const token = cookies.get("Token")
            fetch(`http://${url.hostname}/api/schedule/${username}/${year}/${month}`, {
                method: "GET",
                headers: {
                    "Authorization": token
                }
            }).then((response) => {
                if (response.ok){
                    response.json().then((data) => {
                        const shifts = data.shifts
                        const scheduledDays: Array<number> = []
                        for (let i=0; i<shifts.length; i++){
                            const day = new Date(shifts[i].startTime).getDate()
                            if (!scheduledDays.includes(day)){
                                scheduledDays.push(day)
                            }
                        }
                        setMonthCalendar(<Calendar month={month} year={year} username={username} scheduledDays={scheduledDays}/>)
                    })
                }
            })
        }
    })

    function incrementMonth(increment: 1|-1) {
        let curMonth = month
        let curYear = year

        curMonth += increment

        if (curMonth == -1){
            curMonth = 11
            curYear -= 1
        } else if (curMonth == 12) {
            curMonth = 0
            curYear += 1
        }

        const url = window.location
        const cookies = new Cookies()
        const token = cookies.get("Token")
        fetch(`http://${url.hostname}/api/schedule/${username}/${curYear}/${curMonth}`, {
            method: "GET",
            headers: {
                "Authorization": token
            }
        }).then((response) => {
            if (response.ok){
                response.json().then((data) => {
                    const shifts = data.shifts
                    const scheduledDays: Array<number> = []
                    for (let i=0; i<shifts.length; i++){
                        const day = new Date(shifts[i].startTime).getDate()
                        if (!scheduledDays.includes(day)){
                            scheduledDays.push(day)
                        }
                    }
                    setMonthCalendar(<Calendar month={curMonth} year={curYear} username={username} scheduledDays={scheduledDays}/>)
                })
            }
            setMonth(curMonth)
            setYear(curYear)
        })
    }

    return (
        <>
        <div className="grid grid-cols-3 mb-2">
            {month == currentMonth ? <br /> : <button className="bg-blue-500 hover:bg-blue-700 text-white rounded mx-10" onClick={()=>{incrementMonth(-1)}}>{"<-"}</button>}
            <p className="text-xl text-center">{monthStr} {year}</p>
            <button className="bg-blue-500 hover:bg-blue-700 text-white rounded mx-10" onClick={()=>{incrementMonth(1)}}>{"->"}</button>
        </div>
        {monthCalendar}
        </>
    )
}

type calendarProps = {
    month: number,
    year: number,
    username: string,
    scheduledDays: Array<number>
}

function Calendar({month, year, username, scheduledDays}: calendarProps): ReactNode{
    const daysInMonth = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
    const numDays = daysInMonth[month]
    const firstDay = new Date(year, month, 1).getDay()
    const isCurrentMonth = new Date().getMonth() == month

    function standardiseInt(num: number): string{
        const numAsString = num.toString()
        return numAsString.length == 2 ? numAsString : `0${numAsString}`
    }
    
    function genDayGrid() {
        const days = []

        let weekday = firstDay -1
        weekday = (weekday == -1) ? 6 : weekday

        for (let i=0; i<weekday; i++){
            days.push(<div className="py-4"></div>)
        }
        if (isCurrentMonth){
            const currentDay = new Date().getDate()
            for (let j=0; j<currentDay; j++){
                days.push(<div className="my-4 mx-2 border rounded-full bg-gray-300"><p className="text-center">{j+1}</p></div>)
            }
            for (let k=currentDay; k<numDays; k++){
                if (scheduledDays.includes(k+1)){
                    days.push(<Link to={`/scheduling/${username}/${year}${standardiseInt(month+1)}${standardiseInt(k+1)}`} className="my-4 mx-2 border rounded-full bg-green-400 hover:bg-green-300 hover:shadow-sm"><p className="text-center">{k+1}</p></Link>)
                } else {
                    days.push(<Link to={`/scheduling/${username}/${year}${standardiseInt(month+1)}${standardiseInt(k+1)}`} className="my-4 mx-2 border rounded-full hover:bg-gray-200 hover:shadow-sm"><p className="text-center">{k+1}</p></Link>)
                }
            }

        } else {
            for (let j=0; j<numDays; j++){
                if (scheduledDays.includes(j+1)) {
                    days.push(<Link to={`/scheduling/${username}/${year}${standardiseInt(month+1)}${standardiseInt(j+1)}`} className="my-4 mx-2 border rounded-full bg-green-400 hover:bg-green-300 hover:shadow-sm"><p className="text-center">{j+1}</p></Link>)
                } else {
                    days.push(<Link to={`/scheduling/${username}/${year}${standardiseInt(month+1)}${standardiseInt(j+1)}`} className="my-4 mx-2 border rounded-full hover:bg-gray-200 hover:shadow-sm"><p className="text-center">{j+1}</p></Link>)
                }
            }
        }

        return days
    }

    function isLeapYear(year: number) {
        return (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))
    }


    return (
        <>
        <div className="grid grid-cols-7">
            <div><p className="text-center">Mon</p></div>
            <div><p className="text-center">Tue</p></div>
            <div><p className="text-center">Wed</p></div>
            <div><p className="text-center">Thu</p></div>
            <div><p className="text-center">Fri</p></div>
            <div><p className="text-center">Sat</p></div>
            <div><p className="text-center">Sun</p></div>
            {genDayGrid()}
        </div>
        </>
    )

}