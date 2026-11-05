import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/dashboard";
import ErrorPage from './pages/ErrorPage';
import RegistrarInventario from "./pages/RegistrarInventario";

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
        path: '/inventory_register',
        element: <RegistrarInventario />,
      },
    ],
  },
  // {
  //   element: <DifLayOut />,
  //   children: [
  //     {
  //       path: '/dif/algo',
  //       element: <Algo />,
  //     },
  //     {
  //       path: '/dif/otra',
  //       element: <Algo />,
  //     },
  //   ],
  // },
])
