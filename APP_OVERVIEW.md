# Navis Application Overview and Development Plan

This document summarizes the current state of the Navis application, its core components, and the ongoing development plan based on discussions with the user.

## 1. Application Purpose

Navis is a logistics and transportation management application designed to facilitate the management of shipments, trucks, and drivers. It provides different dashboards and functionalities tailored to specific user roles.

## 2. Role Management

The application implements a role-based access control system using the `accountType` field in the `users` collection.

*   **`root`**: An administrative/superuser role with unrestricted access.
*   **`cargo-mover`**: Manages shipments. Users with this role are redirected to `/root/cargo-mover` after login/registration.
*   **`track-owner`**: Manages trucks. Users with this role are redirected to `/root/trucker` after login/registration.
*   **`driver` (Proposed New Role)**: Will be responsible for real-time location updates, managing their profile, viewing routes, and current delivery details. This role needs to be implemented.

## 3. Data Models (Current and Proposed)

### Current Collections (Firestore)

*   **`users`**:
    *   Fields: `uid` (from Firebase Auth), `username`, `email`, `company`, `accountType`, `imageUrl`.
    *   Relationship: `accountType` defines the user's role. `company` links users to a specific company.
*   **`deliveries`**:
    *   Fields: `uid`, `name`, `state`, `weight`, `weightUnit`, `destination`, `pickupPoint`, `contact`, `status` (`pending`, `assigned`, `in_transit`, `delivered`, `cancelled`), `pickupCoords`, `destinationCoords`, `company`, `date`.
    *   Relationship: `company` links deliveries to the creating company.
*   **`drivers`**:
    *   Fields: `uid`, `name`, `imageUrl`, `company`, `phoneNumber`, `age`, `permitId`, `ninNumber`, `password`.
    *   **Missing:** Real-time location fields (`latitude`, `longitude`) and operational status.
*   **`trucks`**:
    *   Fields: `uid`, `type`, `imageUrl`, `numberPlate`, `yearOfManufacture`, `make`, `mileage`, `fuelType`, `load`, `company`, `speed`.
    *   **Missing:** Real-time location fields (`latitude`, `longitude`) and operational status.
*   **`assignments`**:
    *   Expected to link `deliveryId` to `truckId` and `driverId`. (Exact structure to be confirmed/defined).
*   **`non_user_requests`**:
    *   Used for deliveries originating from non-user sources.

### Proposed Data Model Changes (for Real-time Tracking & Status)

To enable real-time truck tracking and status updates, the following fields need to be added and maintained:

*   **`drivers` Collection:**
    *   **`currentLatitude` (New)**: Driver's current latitude.
    *   **`currentLongitude` (New)**: Driver's current longitude.
    *   **`status` (New)**: Driver's operational status (e.g., 'available', 'on_duty', 'off_duty', 'on_break').
    *   **`currentTruckId` (New)**: ID of the truck the driver is currently operating.
    *   **`companyId` (New)**: Link to the track-owner's company.
*   **`trucks` Collection:**
    *   **`status` (New)**: Truck's operational status (e.g., 'available', 'assigned', 'in_transit', 'maintenance', 'parked').
    *   **`currentDriverId` (New)**: ID of the driver currently operating the truck.
    *   **`currentDeliveryId` (New)**: ID of the delivery the truck is currently assigned to.
*   **`assignments` Collection (Refinement):**
    *   Ensure it explicitly links `deliveryId`, `truckId`, and `driverId`.
    *   May need a `status` field for the assignment itself (e.g., 'active', 'completed', 'cancelled').

## 4. Core Workflows

*   **User Registration:** Users register as `cargo-mover` or `track-owner`, providing company details and an image.
*   **Login:** Users log in, and are redirected to their role-specific dashboard.
*   **Shipment Creation (Cargo Mover):** Cargo movers add new deliveries with pickup/destination details.
*   **Truck/Driver Management (Track Owner):** Track owners add/manage trucks and drivers, and assign drivers to trucks.
*   **Real-time Tracking (Proposed - Driver Role):** Drivers update their location, which is reflected on the map.

## 5. Implemented Features

*   **Cargo Mover Dashboard (`/root/cargo-mover`):**
    *   Displays key shipment metrics (Total, Pending, Active, Completed).
    *   Includes a Material-UI Card for shipment overview and quick actions (View All Shipments, Add New Shipment).
    *   Features a dynamic graph showing "Deliveries over time" and "Requests over time" (weekly aggregation).
        *   *Note:* Graph data is aggregated weekly. `requestsData` is currently empty as no `non_user_requests` were found for the test company.
        *   *Note:* Graph handles single data points by padding with a zero to prevent rendering errors.
*   **Google Maps API Loading (`Maps.js`):**
    *   The `Maps.js` component now internally handles loading the Google Maps API using `LoadScript`.

## 6. Next Steps (Development Plan) - Complete

1.  **Implement `driver` Role:**
    *   Create a registration process for drivers (likely by track owners).
    *   Define driver profile management.
    *   Implement real-time location update mechanism for drivers (e.g., a simple form for now, or a simulated update).
2.  **Update Data Models:** Implement the proposed new fields in `drivers` and `trucks` collections.
3.  **Enhance "Navis Map" (`Maps.js`):**
    *   Fetch all active shipments for the user's company.
    *   Plot all active shipment routes by default.
    *   Fetch real-time driver/truck locations.
    *   Display truck/driver markers on the map.
    *   Implement tooltips for truck/driver markers showing status.
    *   Ensure data isolation: only show logistics for the current user's company.
    *   Add a list of pending/active shipments on the map page.
4.  **Refine `assignments`:** Ensure `assignments` explicitly link `deliveryId`, `truckId`, and `driverId`.
5.  **Integrate `driver` role with `assignments` and `deliveries`:** Link drivers to their current truck and delivery.
