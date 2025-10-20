import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "antd/dist/reset.css";
import "./mobile.css";
import reportWebVitals from "./reportWebVitals";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Dashboard from "./pages/Dashboard";
import Tracks from "./pages/Tracks";
import Drivers from "./pages/Drivers";
import Customers from "./pages/Customers";
import Shipments from "./pages/Shipments";
import RegCustomer from "./pages/RegCustomer";
import AddTruck from "./pages/AddTruck";
import { AuthProvider, useAuth } from "./contexts/AuthContext.js";
import { DatabaseProvider } from "./contexts/DatabaseContext.js";
import TruckManagement from "./pages/TruckManagement";
import CargoMoverDash from "./pages/CargoMoverDash";
import TruckerDash from "./pages/TruckOwnerDash";
import DriverDashboard from "./pages/DriverDashboard"; // New import
import DriverProfile from "./pages/DriverProfile";
import Homepage from "./pages/HomePage.js";
import Contact from "./pages/Contact";
import Deliveries from "./pages/Deliveries.js";
import { AIProvider } from "./contexts/AIContext";
import Multi from "./pages/Multi.js";
import AcceptedDeliveries from "./pages/AcceptedDeliveries.js";
import LoginDriver from "./pages/LoginDriver";
import { LoadScript } from "@react-google-maps/api";
import { DriverAuthProvider, useDriverAuth, } from "./contexts/DriverAuthContext";
import { DriverDeliveryProvider, useDriverDeliveries } from "./contexts/DriverDeliveryContext";
import { CargoMoverDeliveryProvider } from "./contexts/CargoMoverDeliveryContext";
import { CargoMoverDriverProvider } from "./contexts/CargoMoverDriverContext";
import { TruckOwnerTruckProvider } from "./contexts/TruckOwnerTruckContext";
import { TruckOwnerDriverProvider } from "./contexts/TruckOwnerDriverContext";
import { FirebaseProvider } from "./contexts/firebaseContext";
import DeliveriesEnroute from "./pages/DeliveriesEnroute.js";
// console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);
// console.log("Firebase API Key:", process.env.REACT_APP_FIREBASE_API_KEY);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (
    !user ||
    (!allowedRoles.includes(user.accountType) && user.accountType !== "root")
  ) {
    return <Navigate to="/" replace />;
  }
  return children;
};



const DriverProtectedRoute = ({ children }) => {
  const { driver, loading } = useDriverAuth();

  if (loading) {
    return <div>Loading...</div>; // Or a spinner component
  }

  return driver?.accountType === "driver" ? (
    children
  ) : (
    <Navigate to="/login-driver" replace />
  );
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
    path: "/login-driver",
    element: <LoginDriver />,
    errorElement: <ErrorPage />,
  },

  {
    path: "/start",
    element: <Multi />,
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
          <ProtectedRoute allowedRoles={["root"]}>
            <Dashboard />
          </ProtectedRoute>
        ),
      },

      {
        path: "/root/requests",
        element: (
          <ProtectedRoute allowedRoles={["track-owner"]}>
            <Deliveries />
          </ProtectedRoute>
        ),
      },
      
      {
        path: "/root/enroute",
        element: (
          <ProtectedRoute allowedRoles={["track-owner", "root", "cargo-mover"]}>
            <DeliveriesEnroute/>
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/trucker",
        element: (
          <ProtectedRoute allowedRoles={["track-owner"]}>
            <TruckOwnerTruckProvider>
              <TruckOwnerDriverProvider>
                <TruckerDash />
              </TruckOwnerDriverProvider>
            </TruckOwnerTruckProvider>
          </ProtectedRoute>
        ),
      },

      {
        path: "/root/driver", // New route for driver dashboard
        element: (
          <DriverProtectedRoute allowedRoles={["driver"]}>
            <DriverDeliveryProvider>
              <DriverDashboard />
            </DriverDeliveryProvider>
          </DriverProtectedRoute>
        ),
      },
      {
        path: "/root/driver/profile",
        element: (
          <DriverProtectedRoute allowedRoles={["driver"]}>
            <DriverProfile />
          </DriverProtectedRoute>
        ),
      },

      {
        path: "/root/tracks",
        element: (
          <ProtectedRoute allowedRoles={["cargo-mover"]}>
            <Tracks />
          </ProtectedRoute>
        ),
      },
      
     {
        path: "/root/cargo-mover",
        element: (
          <ProtectedRoute allowedRoles={["cargo-mover"]}>
            <CargoMoverDeliveryProvider>
              <CargoMoverDriverProvider>
                <CargoMoverDash />
              </CargoMoverDriverProvider>
            </CargoMoverDeliveryProvider>
          </ProtectedRoute>
        ),
      },

      {
        path: "/root/addTracks",
        element: (
          <ProtectedRoute allowedRoles={["cargo-mover"]}>
            <AddTruck />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/drivers",
        element: (
          <ProtectedRoute allowedRoles={["track-owner"]}>
            <Drivers />
          </ProtectedRoute>
        ),
      },
      {
        path: "/root/truck-management",
        element: (
          <ProtectedRoute allowedRoles={["track-owner"]}>
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
          <ProtectedRoute
            allowedRoles={["cargo-mover"]} >
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
          <ProtectedRoute allowedRoles={["cargo-mover"]}>
            <Shipments />
          </ProtectedRoute>
        ),
      },

      
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
const API_KEY = process.env.REACT_APP_MAPS_API_KEY;
    const libraries = ["places"];

root.render(
  <React.StrictMode>
    <LoadScript googleMapsApiKey={API_KEY} libraries={libraries}>
      <FirebaseProvider>
        <AuthProvider>
          <DatabaseProvider>
            <DriverAuthProvider>
              <RouterProvider router={router} />
            </DriverAuthProvider>
          </DatabaseProvider>
        </AuthProvider>
      </FirebaseProvider>
    </LoadScript>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// Remove this entire duplicate render block
// ReactDOM.render(
//   <React.StrictMode>
//     <FirebaseProvider>
//       <AuthProvider>
//         <DriverAuthProvider>
//           <App />
//         </DriverAuthProvider>
//       </AuthProvider>
//     </FirebaseProvider>
//   </React.StrictMode>,
//   document.getElementById('root')
// );
