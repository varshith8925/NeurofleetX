// frontend/src/components/maps/VehicleMap.jsx
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icon
const createVehicleIcon = (status) => {
  const colors = {
    AVAILABLE: '#10b981',
    IN_USE: '#3b82f6',
    MAINTENANCE: '#f59e0b',
    OUT_OF_SERVICE: '#ef4444'
  };

  return L.divIcon({
    className: 'custom-vehicle-icon',
    html: `
      <div style="
        width: 30px;
        height: 30px;
        background-color: ${colors[status] || '#6b7280'};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

const MapController = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);

  return null;
};

const VehicleMap = ({ vehicles = [], onVehicleClick, center, selectedVehicle }) => {
  const defaultCenter = [17.3850,78.4867]; // Bangalore coordinates as default

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-gray-700">
      <MapContainer
        center={center || defaultCenter}
        zoom={12}
        className="h-full w-full"
        style={{ minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {center && <MapController center={center} />}

        {vehicles.map((vehicle) => (
          vehicle.latitude && vehicle.longitude && (
            <Marker
              key={vehicle.id}
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createVehicleIcon(vehicle.status)}
              eventHandlers={{
                click: () => onVehicleClick && onVehicleClick(vehicle)
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-gray-800">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">{vehicle.model}</p>
                  <p className="text-sm">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs text-white ${
                      vehicle.status === 'AVAILABLE' ? 'bg-green-500' :
                      vehicle.status === 'IN_USE' ? 'bg-blue-500' :
                      vehicle.status === 'MAINTENANCE' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}>
                      {vehicle.status}
                    </span>
                  </p>
                  {vehicle.speed && (
                    <p className="text-sm mt-1">Speed: {vehicle.speed} km/h</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;