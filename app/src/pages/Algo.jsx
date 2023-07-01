import { useContext } from 'react'
import { CurrentUserContext } from '../context/Context'

export default function Algo() {

  const user = useContext(CurrentUserContext)
  
  return (
  <>
    <main>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-yellow-700 dark:text-yellow-600">Hola {user.name}</h1>
      </div>
    </main>
  </>
  )
};
