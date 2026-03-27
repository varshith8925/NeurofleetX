import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom start icon (Green)
const startIcon = L.divIcon({
  className: 'custom-start-icon',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #10b981;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom end icon (Red)
const endIcon = L.divIcon({
  className: 'custom-end-icon',
  html: `
    <div style="
      width: 32px;
      height: 32px;
      background-color: #ef4444;
      border-radius: 50%;
      border: 4px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
      "></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const MapController = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 14
      });
    }
  }, [bounds, map]);

  return null;
};

const RouteMap = ({ 
  source, 
  destination, 
  routes = [], 
  selectedRouteIndex = 0,
  onRouteSelect 
}) => {
  const defaultCenter = [12.9716, 77.5946];

  const getBounds = () => {
    const points = [];
    if (source) points.push(source);
    if (destination) points.push(destination);
    
    // Add all route points to bounds
    routes.forEach(route => {
      if (route.polyline) {
        route.polyline.forEach(point => points.push(point));
      }
    });
    return points.length > 0 ? points : null;
  };

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-gray-700 relative">
      <MapContainer
        center={source || defaultCenter}
        zoom={12}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController bounds={getBounds()} />

        {/* Render all routes */}
        {routes.map((route, index) => {
          const isSelected = index === selectedRouteIndex;
          const routeColor = route.color || '#6366f1';
          
          return (
            route.polyline && (
              <Polyline
                key={route.id || index}
                positions={route.polyline}
                pathOptions={{
                  color: routeColor,
                  weight: isSelected ? 7 : 4,
                  opacity: isSelected ? 0.9 : 0.5,
                  dashArray: isSelected ? null : '10, 10',
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
                eventHandlers={{
                  click: () => {
                    if (onRouteSelect) {
                      onRouteSelect(index);
                    }
                  },
                  mouseover: (e) => {
                    e.target.setStyle({ weight: 8, opacity: 1 });
                  },
                  mouseout: (e) => {
                    if (!isSelected) {
                      e.target.setStyle({ weight: 4, opacity: 0.5 });
                    }
                  }
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-gray-800 mb-2">{route.name}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>📏 Distance: {route.distance} km</p>
                      <p>⏱️ Duration: {route.duration} min</p>
                      <p>💰 Fare: ₹{route.fare}</p>
                      {route.tolls > 0 && <p>🛣️ Tolls: ₹{route.tolls}</p>}
                      <p>🚦 Traffic: {route.traffic}</p>
                    </div>
                    {route.recommended && (
                      <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-semibold text-center">
                        ⭐ Recommended
                      </div>
                    )}
                  </div>
                </Popup>
              </Polyline>
            )
          );
        })}

        {/* Source Marker */}
        {source && (
          <Marker position={source} icon={startIcon}>
            <Popup>
              <div className="p-2">
                <span className="font-semibold text-green-700">📍 Start Point</span>
                <p className="text-xs text-gray-600 mt-1">
                  {source[0].toFixed(5)}, {source[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {destination && (
          <Marker position={destination} icon={endIcon}>
            <Popup>
              <div className="p-2">
                <span className="font-semibold text-red-700">🏁 Destination</span>
                <p className="text-xs text-gray-600 mt-1">
                  {destination[0].toFixed(5)}, {destination[1].toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Route Legend */}
      {routes.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Available Routes</h4>
          <div className="space-y-1">
            {routes.map((route, index) => (
              <button
                key={route.id || index}
                onClick={() => onRouteSelect && onRouteSelect(index)}
                className={`w-full flex items-center space-x-2 p-2 rounded hover:bg-gray-100 transition-colors ${
                  index === selectedRouteIndex ? 'bg-blue-50 border border-blue-300' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: route.color }}
                ></div>
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium text-gray-800">{route.name}</p>
                  <p className="text-xs text-gray-600">{route.distance} km • {route.duration} min</p>
                </div>
                {route.recommended && (
                  <span className="text-xs">⭐</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;