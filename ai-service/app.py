# ai-service/app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import heapq
import math
import random

app = Flask(__name__)
CORS(app)

def haversine_distance(lat1, lon1, lat2, lon2):
    """Calculate distance between two points in kilometers"""
    R = 6371  # Earth's radius in km
    
    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)
    
    a = math.sin(delta_lat/2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    
    return R * c

def generate_route_polyline(source, destination, route_type='direct', num_points=25):
    """Generate route polyline with waypoints based on route type"""
    polyline = []
    
    lat_diff = destination['lat'] - source['lat']
    lng_diff = destination['lng'] - source['lng']
    
    if route_type == 'direct':
        # Straight-ish route with minor variations
        for i in range(num_points + 1):
            t = i / num_points
            random_offset_lat = random.uniform(-0.0015, 0.0015) if 0 < t < 1 else 0
            random_offset_lng = random.uniform(-0.0015, 0.0015) if 0 < t < 1 else 0
            
            lat = source['lat'] + (lat_diff * t) + random_offset_lat
            lng = source['lng'] + (lng_diff * t) + random_offset_lng
            polyline.append([lat, lng])
    
    elif route_type == 'highway':
        # Route that goes slightly out then comes back (simulating highway)
        for i in range(num_points + 1):
            t = i / num_points
            # Create arc effect
            arc_offset_lat = math.sin(t * math.pi) * 0.01
            arc_offset_lng = math.sin(t * math.pi) * 0.01
            
            lat = source['lat'] + (lat_diff * t) + arc_offset_lat
            lng = source['lng'] + (lng_diff * t) + arc_offset_lng
            polyline.append([lat, lng])
    
    elif route_type == 'scenic':
        # More curvy route (avoiding tolls/highways)
        for i in range(num_points + 1):
            t = i / num_points
            # Create S-curve effect
            curve_offset_lat = math.sin(t * math.pi * 2) * 0.015
            curve_offset_lng = math.cos(t * math.pi * 2) * 0.015
            
            lat = source['lat'] + (lat_diff * t) + curve_offset_lat
            lng = source['lng'] + (lng_diff * t) - curve_offset_lng
            polyline.append([lat, lng])
    
    return polyline

def calculate_route_distance(polyline):
    """Calculate total distance of a route from polyline"""
    total_distance = 0
    for i in range(len(polyline) - 1):
        total_distance += haversine_distance(
            polyline[i][0], polyline[i][1],
            polyline[i+1][0], polyline[i+1][1]
        )
    return total_distance

@app.route('/api/routes/optimize', methods=['POST'])
def optimize_route():
    try:
        data = request.json
        source = data.get('source')
        destination = data.get('destination')
        optimization_type = data.get('optimizationType', 'time')
        
        if not source or not destination:
            return jsonify({'error': 'Source and destination are required'}), 400
        
        # Calculate base distance
        distance = haversine_distance(
            source['lat'], source['lng'],
            destination['lat'], destination['lng']
        )
        
        # Estimate time based on type
        if optimization_type == 'time':
            avg_speed = 50  # km/h
        elif optimization_type == 'distance':
            avg_speed = 40
        else:
            avg_speed = 35
        
        base_time = (distance / avg_speed) * 60  # in minutes
        
        # Generate route polyline
        polyline = generate_route_polyline(source, destination, 'direct')
        
        # Calculate fare
        fare = round(distance * 15 + base_time * 2)
        
        result = {
            'success': True,
            'data': {
                'name': 'Optimal Route',
                'type': optimization_type.upper(),
                'polyline': polyline,
                'distance': round(distance, 2),
                'duration': round(base_time),
                'energy': round(distance * 0.15, 2),
                'fare': fare,
                'tolls': 0
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/routes/multiple', methods=['POST'])
def get_multiple_routes():
    try:
        data = request.json
        source = data.get('source')
        destination = data.get('destination')
        
        if not source or not destination:
            return jsonify({'error': 'Source and destination are required'}), 400
        
        # Calculate base distance
        base_distance = haversine_distance(
            source['lat'], source['lng'],
            destination['lat'], destination['lng']
        )
        
        routes = []
        
        # Route 1: Fastest (Via Highway) - Blue color
        fastest_polyline = generate_route_polyline(source, destination, 'highway', 20)
        fastest_distance = calculate_route_distance(fastest_polyline)
        fastest_time = (fastest_distance / 60) * 60  # 60 km/h avg on highway
        routes.append({
            'id': 1,
            'name': 'Fastest Route',
            'type': 'FASTEST',
            'description': 'Via highways - fastest travel time',
            'polyline': fastest_polyline,
            'distance': round(fastest_distance, 2),
            'duration': round(fastest_time),
            'fare': round(fastest_distance * 18 + fastest_time * 2),
            'tolls': 50,
            'traffic': 'Light',
            'color': '#3b82f6',  # Blue
            'recommended': True
        })
        
        # Route 2: Shortest (Direct) - Green color
        shortest_polyline = generate_route_polyline(source, destination, 'direct', 15)
        shortest_distance = calculate_route_distance(shortest_polyline)
        shortest_time = (shortest_distance / 40) * 60  # 40 km/h avg
        routes.append({
            'id': 2,
            'name': 'Shortest Route',
            'type': 'SHORTEST',
            'description': 'Most direct path',
            'polyline': shortest_polyline,
            'distance': round(shortest_distance, 2),
            'duration': round(shortest_time),
            'fare': round(shortest_distance * 15 + shortest_time * 2),
            'tolls': 0,
            'traffic': 'Moderate',
            'color': '#10b981',  # Green
            'recommended': False
        })
        
        # Route 3: Economical (Avoid Tolls) - Yellow color
        eco_polyline = generate_route_polyline(source, destination, 'scenic', 30)
        eco_distance = calculate_route_distance(eco_polyline)
        eco_time = (eco_distance / 35) * 60  # 35 km/h avg
        routes.append({
            'id': 3,
            'name': 'Economical Route',
            'type': 'ECONOMICAL',
            'description': 'Avoid tolls - save money',
            'polyline': eco_polyline,
            'distance': round(eco_distance, 2),
            'duration': round(eco_time),
            'fare': round(eco_distance * 12 + eco_time * 1.5),
            'tolls': 0,
            'traffic': 'Heavy',
            'color': '#f59e0b',  # Yellow
            'recommended': False
        })
        
        return jsonify({
            'success': True,
            'data': routes
        })
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'service': 'NeuroFleetX AI Route Service'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)