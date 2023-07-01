import { useContext } from 'react'
import { CurrentUserContext } from '../context/Context'

export default function Home() {

  const user = useContext(CurrentUserContext)
  
  return (
  <>
    <header className="bg-white dark:bg-neutral-900 shadow">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-200">Home</h1>
      </div>
    </header>
    <main>
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-yellow-700 dark:text-yellow-600">Hola {user.name}</h1>
      </div>
    </main>
  </>
  )
};
