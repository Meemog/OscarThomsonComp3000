import { useEffect, useState } from "react"

export default function Database() {
  const [content, setContent] = useState("")

  useEffect(() => {
    const url = window.location
    fetch(`http://${url.hostname}/api/test?num=42`)
      .then((response) => response.json())
      .then((jsonResponse) => {
        setContent(jsonResponse.text)
      })
  }, [])

  return (
    <>
    <h1>Some database data:</h1>
    <p>{content}</p>
    </>
  )
}