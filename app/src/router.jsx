import { createBrowserRouter } from "react-router";

import Dashboard from "./app/dashboard/dashboard"
import ErrorPage from './pages/ErrorPage'
// import MainLayOut from "./layouts/MainLayOut";
// import Home from "./pages/Home";
// import Dashboard from "./pages/Dashboard";
// import DifLayOut from "./layouts/DifLayOut";
// import Algo from './pages/Algo'
// import Register from "./pages/RegisterNewUser";



export const router = createBrowserRouter([
  {
    path: '/',
    element: <Dashboard />,
    errorElement: <ErrorPage />,
  },
])



// export const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <MainLayOut />,
//     errorElement: <ErrorPage />,
//     children: [
//       {
//         index: true,
//         element: <Home />,
//       },
//       {
//         path: '/dashboard',
//         element: <Dashboard />,
//       },
//       {
//         path: '/register',
//         element: <Register />,
//       },
//     ],
//   },
//   {
//     element: <DifLayOut />,
//     children: [
//       {
//         path: '/dif/algo',
//         element: <Algo />,
//       },
//       {
//         path: '/dif/otra',
//         element: <Algo />,
//       },
//     ],
//   },
// ])
