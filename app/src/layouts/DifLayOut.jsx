import { Outlet, Link } from "react-router-dom";



export default function DifLayOut () {
  

  return (
    <>
    <p className="text-sm text-gray-500 dark:text-gray-400">difLayout</p>
      <div className="min-h-full flex justify-center">
        <main>
          <Outlet />
          <div className="mt-12 flex justify-center">
          <Link
            to='/'
            className="rounded-md bg-indigo-600 dark:bg-indigo-500 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 dark:hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:focus-visible:outline-indigo-500"
          >
            Sácame de aquí
          </Link>
      </div>
        </main>
      </div>
    </>
  )
};
