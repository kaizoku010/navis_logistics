import React, { createContext, useContext, useState } from 'react';
import { dijkstra, recommendTruck as recommendTruckHelper, calculateDeliveryTime as calculateDeliveryTimeHelper } from './aiHelpers';

const AIContext = createContext();

export const useAI = () => useContext(AIContext);

export const AIProvider = ({ children }) => {
  const [optimizedRoute, setOptimizedRoute] = useState(null);
  const [recommendedTruck, setRecommendedTruck] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);

  const graph = {
    A: { B: 1, C: 4 },
    B: { A: 1, C: 2, D: 5 },
    C: { A: 4, B: 2, D: 1 },
    D: { B: 5, C: 1 },
  };

  const fetchOptimizedRoute = (origin, destination) => {
    if (!origin || !destination) {
      console.error("Origin or destination is missing");
      return;
    }
    try {
      const { path, distance } = dijkstra(graph, origin, destination);
      setOptimizedRoute({ path, distance });
    } catch (error) {
      console.error("Error in fetchOptimizedRoute:", error);
    }
  };

  const recommendTruck = (weight, state) => {
    const truck = recommendTruckHelper(weight, state);
    setRecommendedTruck(truck);
  };

  const calculateDeliveryTime = (origin, destination) => {
    if (!origin || !destination) {
      console.error("Origin or destination is missing");
      return;
    }
    try {
      const { distance } = dijkstra(graph, origin, destination);
      const time = calculateDeliveryTimeHelper(distance);
      setEstimatedTime(time);
    } catch (error) {
      console.error("Error in calculateDeliveryTime:", error);
    }
  };

  return (
    <AIContext.Provider value={{
      fetchOptimizedRoute,
      recommendTruck,
      calculateDeliveryTime,
      optimizedRoute,
      recommendedTruck,
      estimatedTime
    }}>
      {children}
    </AIContext.Provider>
  );
};
