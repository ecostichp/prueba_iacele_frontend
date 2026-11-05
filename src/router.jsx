import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard";
import ErrorPage from './pages/ErrorPage';
import InventoryIndividualCount from "./pages/InventoryIndividualCount";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: '/inventory',
        element: <InventoryIndividualCount />,
      },
    ],
  },
]);



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
