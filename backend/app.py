from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS to allow communication from the React frontend

# In-memory data storage (for demonstration purposes)
trips = []
recommendations = [
    {"id": 1, "name": "Hidden Museum", "category": "Historical", "location": "City A"},
    {"id": 2, "name": "Art Gallery", "category": "Art", "location": "City B"}
]

@app.route('/api/trips', methods=['GET', 'POST'])
def trip_handler():
    if request.method == 'POST':
        data = request.get_json()
        # In a real app, you'd add logic for autocomplete and data validation here.
        trips.append(data)
        return jsonify({"message": "Trip logged successfully", "trip": data}), 201
    else:
        return jsonify(trips)

@app.route('/api/recommendations', methods=['GET'])
def get_recommendations():
    # Ideally, recommendations are dynamically generated based on past logs and interests.
    return jsonify(recommendations)

if __name__ == '__main__':
    app.run(debug=True)
