import { Main } from "@/templates/Main"
import { Meta } from "@/layouts/Meta"
import { reqOptions } from "@/utils/Appconfig"
import Router from "next/router"
import { useEffect, useRef, useState } from "react"
import { createStructure, deconstruct, easyFetch } from "@/utils/helpers"

export async function getServerSideProps() {
    let imageList = await easyFetch("getImages", {method:"POST", headers: {"Content-type": "image/jpg"}})
    const enTable = await easyFetch("readTable", {headers: {data: "en"}})
    const esTable = await easyFetch("readTable", {headers: {data: "es"}})
    const catTable = await easyFetch("readTable", {headers: {data: "cat"}})
    if (typeof(imageList) == typeof("")) {
        imageList = []
    }
    return {
      props: {imageList, enTable, esTable, catTable}, 
    }
}

const DownloadCSVs = ({imageList, enTable, esTable, catTable}: any) => {
    const [loading, setLoading] = useState<boolean>(false)
    const [saved, setSaved] = useState<string>("")
    const [currentLang, setCurrentLang] = useState<string>("cat")
    const [initialState, setInitialState] = useState<any[]>([])
    let firstLoad = true

    useEffect(() => {
        console.log("in use effect")
        if (!firstLoad) return
        if (currentLang == "cat") createDescription(catTable)
        if (currentLang == "en") createDescription(enTable)
        if (currentLang == "es") createDescription(esTable)
        firstLoad = false
    }, [currentLang])

    const handleLang = () => {
        if (currentLang == "cat") setCurrentLang("es")
        if (currentLang == "es") setCurrentLang("en")
        if (currentLang == "en") setCurrentLang("cat")
        firstLoad = true
    }

    const handleDownload = async () => {
        setLoading(true)
        const compressImagesEndpoint = reqOptions["uri"]["compress"]
        await fetch(compressImagesEndpoint)
        const setImagesEndpoint = reqOptions["uri"]["setImage"]
        await fetch(setImagesEndpoint)
        const csvEndpoint = reqOptions["uri"]["csv"]
        const csvResponse = await fetch(csvEndpoint)
        const parsedCsvResponse = await csvResponse.json()
        const ftpEndpoint = reqOptions["uri"]["ftp"]
        const ftpPost = reqOptions["postImg"]
        const ftpResponse = await fetch(ftpEndpoint, ftpPost)
        const parsedFtpResonse = await ftpResponse.json()
        if (parsedFtpResonse.message === 200 && parsedCsvResponse.message === 200) {
            setSaved("OK")
            const testEndpoint = reqOptions["uri"]["script"]
            const testResponse = await fetch(testEndpoint)
            const parsedTestResponse = await testResponse.json()
            const updateIG = await fetch("/api/updateIG")
            const parsedUpdateIG = await updateIG.json()
            console.log(parsedUpdateIG)
            console.log(parsedTestResponse)
            setLoading(false)
            return setTimeout(() => setSaved(""), 5000)
        } else {
            setSaved("ERROR")
            setLoading(false)
            return setTimeout(() => setSaved(""), 8000)
        }
        
    }

    const handleRemoveTables = async () => {
        const endPoint = reqOptions["uri"]["remove"]
        const post = reqOptions["post"]
        Router.push("/tableCreator")
        const response = await fetch(endPoint, post)

        return response
    }

    const handleDeleteButton = async (id: string) => {
        const endpoint = reqOptions["uri"]["delete"]
        const post = reqOptions["post"]
        post.body = JSON.stringify(id)
        const response = await fetch(endpoint, post)
        Router.reload()
        return response
    }

    const handleEdit = async (id: string, ctx: string, price: string, editButton: HTMLButtonElement) => {
        const table = document.getElementById(id)
        const currentPrice = document.getElementById("price")!.innerText
        const priceSlice = currentPrice.split(" ")[1]?.slice(1).replace(/\D/g,'').trim()
        if (editButton.innerText == "Save") {
            table?.removeAttribute("contenteditable")
            editButton.innerText = "Edit"
            const saveTbl = JSON.stringify(deconstruct(ctx))
            const post = reqOptions["post"]
            post.body = saveTbl
            Object.assign(post.headers, {lang: currentLang});
            Object.assign(post.headers, {id});
            Object.assign(post.headers, {price: priceSlice ?? price});
            const response = await fetch("/api/updateTables", post)
            return response
        }
        const tbl = deconstruct(ctx)
        setInitialState(tbl)
        table?.setAttribute("contenteditable", "true")
        editButton.innerText = "Save"
        return console.log(table)
    }

    const createDescription = (table: any[]) => {
        for (let i = 0, l = table.length; i < l; i++) {
            const parentObject: any = document.querySelector(`#${table[i]!["ID"]}`)
            parentObject.replaceChildren()
            const deleteButton: any = document.createElement("a")
            const tableElement: HTMLTableElement = document.createElement("table")
            const divElement: HTMLDivElement = document.createElement("div")
            const editButton: HTMLButtonElement = document.createElement("button")
            const title: any = document.createElement("h3")

            const tableStructure = createStructure(table[i]!["TestDescription"])
            tableElement.innerHTML = tableStructure
            tableElement.style.textAlign = "left"
            tableElement.style.margin = "auto"

            title.innerText = `${
                table[i]!["ID"]
            } (${table[i]!["Price"]}€)`
            title.style.fontWeight = "900"
            title.style.textAlign = "left"
            title.setAttribute("id", "price")

            divElement.style.display = "flex"
            divElement.style.justifyContent = "space-between"
            divElement.style.maxWidth = "20vw"
            divElement.style.margin = "auto"

            editButton.className = "text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-small rounded-lg text-xs px-3 py-1.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700"
            editButton.innerText = "Edit"
            editButton.style.alignSelf = "center"
            editButton.style.marginBottom = ".2rem"
            editButton.addEventListener("click", () => {
                handleEdit(table[i]!["ID"], parentObject.children[1].innerText, table[i]!["Price"], editButton)
            })
            divElement.appendChild(title)
            divElement.appendChild(editButton)

            parentObject.appendChild(divElement)
            parentObject.appendChild(tableElement)
            parentObject.style.marginBottom = "1rem"
            parentObject.style.marginTop = "1em"
            
            deleteButton.innerText = "Remove"
            deleteButton.style.marginTop = "1em"
            deleteButton.style.display = "inline-block"
            deleteButton.className =
                "bg-red-500 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-4 rounded"
            deleteButton.onclick = () => {
                const result = confirm(`Segur que vols borrar ${table[i]!["Name"]}?`)
                if (result) handleDeleteButton(table[i]!["ID"])
            }

            parentObject.appendChild(deleteButton)
        }
    }

    return (
        <Main
            meta={
                <Meta
                    title="Download CSV"
                    description="Check registered gems and download the translated CSVs"
                ></Meta>
            }
            current="CSV"
        >
            <div className="mx-auto mt-[-15px] pb-4">
                <button className="fixed bottom-4 text-white bg-blue-700 hover:bg-blue-800 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700" onClick={handleLang}>{currentLang}</button>
                {catTable.map((gem: any, id: any) => (
                    <ul
                        className="mx-auto mt-2 text-center border-b border-gray-300"
                        id={id}
                        key={id}
                    >
                        {imageList.length > 0 ? (
                            <li className="flex gap-1 justify-center mt-8">
                                {imageList.map((img: string, id: number) => {
                                    return img.includes(gem["ID"]) ? (
                                        <img
                                            key={id}
                                            src={`assets/images/gems/${img}`}
                                            className="w-[15%]"
                                        />
                                    ) : null
                                })}
                            </li>
                        ) : null}
                        <li id={gem["ID"]}></li>
                    </ul>
                ))}
                {!loading ?
                    saved === "OK" ? 
                <div className="mx-auto bg-green-300 py-2 px-4">
                    
                    <p className="text-center text-sm"><span>&#10003;</span> Fitxers penjats correctament!</p>
                </div>
                : saved === "ERROR" ? <div className="mx-auto bg-red-300 py-2 px-4">
                    
                <p className="text-center text-sm"><span>&#10003;</span> Hi ha hagut un error enviant els fitxers! Envia un missatge a l&#39;Albert!!</p>
            </div>
                :null: null}
                <div className="mx-auto flex justify-center gap-4 mt-12 sm:justify-around">
                {loading ? 
                        <button
                            disabled
                            type="button"
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                        >
                            <svg
                                role="status"
                                className="inline mr-3 w-4 h-4 text-white animate-spin"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="#E5E7EB"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentColor"
                                />
                            </svg>
                            Enviant fitxers...
                        </button> : 
                    <button
                        onClick={() => {
                            handleDownload()
                        }}
                        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
                    >
                        <svg
                            className="fill-current w-4 h-4 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                        </svg>
                        <span>Penjar fitxers</span>
                    </button>}
                    <button
                        onClick={() => {
                            const result = confirm(`Segur que vols borrar totes les taules?`)
                            if (result) handleRemoveTables()
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                        Clean Tables
                    </button>
                </div>
            </div>
        </Main>
    )
}

export default DownloadCSVs