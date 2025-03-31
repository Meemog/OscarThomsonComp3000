import Cookies from "universal-cookie";

interface auth {
    loggedIn: boolean,
    data: userData | null
}

interface userData {
    username: string,
    type: string,
}

// Gets cookie and returns user data if logged in
export async function authenticate(): Promise<auth>{
    const cookies = new Cookies()
    const token = cookies.get("Token")

    console.log(token)

    if (!token){
        return({
            loggedIn: false,
            data: null
        })
    }

    const url = window.location
    const response: Response = await fetch(`http://${url.hostname}/api/auth`, {
        method: "GET",
        headers:{
            "Authorization": token,
            "Content-Type": "application/json"
        }
    })
    if (!response.ok){
        const cookies = new Cookies()
        cookies.remove("Token")
        return({
            loggedIn: false,
            data: null
        })
    }
    const data = await response.json()
    return({
        loggedIn: true,
        data:{
            username: data.username,
            type: data.accountType,
        }
    })
}

export function logout() {
    if (confirm("Are you sure you want to log out?")){
        const cookies = new Cookies()
        cookies.remove("Token")
        const url = window.location
        window.location.replace(`http://${url.hostname}:${url.port}/`)
    }
}