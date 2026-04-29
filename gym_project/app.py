from flask import Flask, make_response, jsonify
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.class_routes import class_bp
from routes.booking_routes import booking_bp
from routes.analytics_routes import analytics_bp

app = Flask(__name__)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:4200"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)

app.config["JWT_SECRET_KEY"] = "my-super-secure-jwt-secret-key-for-gym-project-2026"
jwt = JWTManager(app)

app.register_blueprint(auth_bp)
app.register_blueprint(class_bp)
app.register_blueprint(booking_bp)
app.register_blueprint(analytics_bp)

@app.route("/", methods=['GET'])
def home():
    return make_response(jsonify({"message": "Gym API is running"}), 200)

if __name__ == "__main__":
    app.run(debug=True, port=5001)