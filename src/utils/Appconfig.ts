export interface SubConfig {
    site_name?: string
    title: string
    description: string
    locale?: string
}

export interface AppConfigInterface {
    [key: string]: SubConfig
}

export const AppConfig: AppConfigInterface = {
    home: {
        site_name: "Templates",
        title: "Templates Home Page",
        description: "Web page to create csv and table templates for gems",
        locale: "en",
    },
    table: {
        title: "Table Creator",
        description: "Populate table, translate it and export into csv!",
    },
    CSV: {
        title: "Download CSV",
        description: "Check registered gems and download the translated CSVs",
    },
    images: {
        title: "Upload & Edit Images",
        description: "Upload, Crop, Resize Images",
    },
    descriptions: {
        title: "Gem Descriptions",
        description: "Check and edit descriptions",
    },
    updateDescriptions: {
        title: "Update Descriptions",
        description: "Click the button to update descriptions"
    }
}

export const reqOptions = {
    uri: {
        en: `/api/writeENTable`,
        es: `/api/writeESTable`,
        cat: `/api/writeCATTable`,
        remove: `/api/deleteTables`,
        delete: `/api/deleteElement`,
        image: `/api/saveImage`,
        getImages: `/api/getImages`,
        downloadImages: `/api/downloadImages`,
        table: `/api/readTable`,
        ftp: `/api/sendFTP`,
        csv: `/api/saveCsv`,
        script: `/api/importScript`,
        compress: `/api/compressImages`,
        setImage: `/api/setImages`,
        saveDescriptionsCSV: `/api/saveDescriptionsCSV`
    },
    post: {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: "",
    },
    postImg: {
        method: "POST",
        headers: {
            "Content-Type": "image/jpg",
            name: "",
            index: "",
        },
        body: "",
    },
}