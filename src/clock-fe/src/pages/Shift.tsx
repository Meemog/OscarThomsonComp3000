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
                    console.log(data.shift)
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