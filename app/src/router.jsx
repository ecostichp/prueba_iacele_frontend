import { createBrowserRouter } from "react-router-dom";

import MainLayOut from "./layouts/MainLayOut";
import ErrorPage from './pages/ErrorPage'
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DifLayOut from "./layouts/DifLayOut";
import Algo from './pages/Algo'
import Register from "./pages/RegisterNewUser";




export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayOut />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: '/dashboard',
        element: <Dashboard />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
  {
    element: <DifLayOut />,
    children: [
      {
        path: '/dif/algo',
        element: <Algo />,
      },
      {
        path: '/dif/otra',
        element: <Algo />,
      },
    ],
  },
])
