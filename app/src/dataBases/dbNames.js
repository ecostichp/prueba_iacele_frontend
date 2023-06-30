import localforage from "localforage";



let wep = {
    status: 'Conexión exitosa a IndexDB',
}

localforage.setItem('wep', wep)


const cotStore = localforage.createInstance({
    name: "Cotizaciones"
});

cotStore.setItem('wep', wep)




// localforage.clear()


const dbClear = async () => {
    const dbs = await window.indexedDB.databases()
    dbs.forEach(db => { window.indexedDB.deleteDatabase(db.name) })
}

// dbClear()