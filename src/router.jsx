import { createBrowserRouter } from "react-router";
import MainLayout from "./layouts/MainLayout";
import ErrorPage from './pages/ErrorPage';
import MyRecords from "./pages/MyRecords";
import RegisterInventory from "./pages/RegisterInventory";
import ClearInventory from "./pages/ClearInventory";
import CloseAccess from "./pages/CloseAccess";
import AllRecords from "./pages/AllRecords";
import Metrics from "./pages/Metrics";
import Coworkers from "./pages/Coworkers";

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <MyRecords />,
      },
      {
        path: '/inventory_register',
        element: <RegisterInventory />,
      },
      {
        path: '/database/inventory',
        element: <ClearInventory />,
      },
      {
        path: '/database/access',
        element: <CloseAccess />,
      },
      {
        path: '/all_records',
        element: <AllRecords />,
      },
      {
        path: '/metrics',
        element: <Metrics />,
      },
      {
        path: '/coworkers',
        element: <Coworkers />,
      },
    ],
  },
])
