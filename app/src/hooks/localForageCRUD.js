import localforage from "localforage";


export async function localForageGet (key, setState, setError) {

    try {
      const value = await localforage.getItem(key)
      setState(value)

    } catch (error) {
      setError(error)
    }

 }