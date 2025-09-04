import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from './pages/Login';
import Root from './routes/root';
import ErrorPage from './error-page';
import Dashboard from './pages/Dashboard';
import Tracks from './pages/Tracks';
import Drivers from './pages/Drivers';
import Customers from './pages/Customers';
import Shipments from './pages/Shipments';
import RegCustomer from './pages/RegCustomer';
import AddTruck from './pages/AddTruck';
import { AuthProvider, useAuth } from './contexts/AuthContext.js';
import { DatabaseProvider } from './contexts/DatabaseContext.js';
import TruckManagement from './pages/TruckManagement';
import CargoMoverDash from "./pages/CargoMoverDash"
import TruckerDash from "./pages/TruckOwnerDash"
import Homepage from  "./pages/HomePage.js"
import Contact from "./pages/Contact"
import Deliveries from './pages/Deliveries.js';
import { AIProvider } from './contexts/AIContext';
import Multi from './pages/Multi.js';
import AcceptedDeliveries from './pages/AcceptedDeliveries.js';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || (!allowedRoles.includes(user.accountType) && user.accountType !== 'root')) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <ErrorPage />,
  },

  {
    path: "/login",
    element: <Login />,
    errorElement: <ErrorPage />,
  },


  {
    path: "/start",
    element: <Multi/>,
    errorElement: <ErrorPage />,
  },



  {
    path: "/sales",
    element: <Contact />,
    errorElement: <ErrorPage />,
  },
  {
    path: "regesiter",
    element: <RegCustomer />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/root",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/root/dashboard",
        element: (
          <ProtectedRoute allowedRoles={['root']}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/cargo-mover",
        element: (
          <ProtectedRoute allowedRoles={['cargo-mover']}>
            <CargoMoverDash />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/trucker",
        element: (
          <ProtectedRoute allowedRoles={['track-owner']}>
            <TruckerDash />
          </ProtectedRoute>
        ),

      },

      {
        path: "/root/requests",
        element: (
          <ProtectedRoute allowedRoles={['track-owner']}>
            <Deliveries />
          </ProtectedRoute>
        ),

      },


      {
        path: "/root/tracks",
        element: (
          <ProtectedRoute allowedRoles={['cargo-mover']}>
            <Tracks />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/addTracks",
        element: (
          <ProtectedRoute allowedRoles={['cargo-mover']}>
            <AddTruck />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/drivers",
        element: (
          <ProtectedRoute allowedRoles={['track-owner']}>
            <Drivers />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/truck-management",
        element: (
          <ProtectedRoute allowedRoles={['track-owner']}>
            <TruckManagement />
          </ProtectedRoute>
        ),
      },
      // {
      //   path: "/root/map",
      //   element: (
      //     <ProtectedRoute allowedRoles={['track-owner']}>
      //       <Maps />
      //     </ProtectedRoute>
      //   ),
      // },
      {
        path: "/root/map",
        element: (
          <ProtectedRoute allowedRoles={['track-owner', 'cargo-mover']}>
            <AcceptedDeliveries />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/customers",
        element: <Customers />,
      },
      {
        path: "/root/shipments",
        element: (
          <ProtectedRoute allowedRoles={['cargo-mover']}>
            <Shipments />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <AuthProvider>
      <DatabaseProvider>
        <AIProvider>
          <RouterProvider router={router} />
        </AIProvider>
      </DatabaseProvider>
    </AuthProvider>
  </React.StrictMode>,
);

reportWebVitals();
