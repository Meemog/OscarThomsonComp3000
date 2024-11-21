import { Link } from "react-router-dom"

export default function Register() {
    return(
        <>
        <div className="mx-auto w-full max-w-md">
            <h1 className="text-2xl text-center mb-2">Register</h1>
            <div className="p-6 border-solid border-2 grid grid-cols-2">
                <div>
                    <form className="space-y-3">

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="username">Username:</label>
                            </div>
                            <div>
                                <input className="border border-gray-300 rounded" name="username" type="text" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="username">Email:</label>
                            </div>
                            <div>
                                <input className="border border-gray-300 rounded" name="username" type="text" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="password">Password:</label>
                            </div>
                            <div>
                                <input className="border border-gray-300 rounded" name="password" type="password" />
                            </div>
                        </div>

                        <div className="mb-3">
                            <div>
                                <label className="text-sm" htmlFor="password">Confirm Password:</label>
                            </div>
                            <div>
                                <input className="border border-gray-300 rounded" name="password" type="password" />
                            </div>
                        </div>

                        <button className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded">Submit</button>

                    </form>
                </div>
                <div className="flex">
                    <div className="content-center">
                        <div>
                            <p className="text-center">Already have an account?</p>
                            <div className="flex justify-center">
                                <Link to="/login" className="bg-blue-500 hover:bg-blue-700 text-white px-2 py-1 rounded">Login</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}