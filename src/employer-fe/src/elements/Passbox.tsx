import { ReactNode, useState } from "react";

type passProps = {
    passId: string,
    inputHandler: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

export default function PassBox( {passId, inputHandler}: passProps ): ReactNode {
    const [inputType, setInputType] = useState("password")
    const [img, setImg] = useState("/show.png")

    function toggle(): void {
        if (inputType === "password"){
            setInputType("text")
            setImg("/hide.png")
        } else {
            setInputType("password")
            setImg("/show.png")
        }
    }

    return (
        <div className="grid grid-cols-7">
            <div className="col-span-6 mr-1">
                <input id={passId} className="border border-gray-300 rounded w-full" name="password" type={inputType} onKeyDown={inputHandler}/>
            </div>
            <div className="col-span-1">
                <button type="button" onClick={toggle}><img src={img}></img></button>
            </div>
        </div>
    )
}