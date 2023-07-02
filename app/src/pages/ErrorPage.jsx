import { useRouteError, Link } from "react-router-dom";



export default function ErrorPage() {
  
  const error = useRouteError();
  

  return (

    <div className="flex flex-col items-center mt-12">

      <div className="dark:bg-neutral-700 rounded-lg p-4">
          <img
              className="mx-auto max-h-24 w-auto"
              src='./brand/Logo2021.png'
              alt="La Casa Del Carpintero"
          />
      </div>

      <h2 className="my-12 text-5xl font-bold text-gray-900 dark:text-gray-50">
        ¡Ups!
      </h2>
              
      <p className="text-gray-700 dark:text-gray-200">
        No encontramos la página que buscas
      </p>

      <i className="mt-1 text-xs text-gray-600 dark:text-gray-400">
        {error.statusText || error.message}
      </i>
      
      <div className="mt-12">
        <Link
          to='/'
          className="flex w-full justify-center rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
        >
          Sácame de aquí
        </Link>
      </div>

    </div>

  )
}
