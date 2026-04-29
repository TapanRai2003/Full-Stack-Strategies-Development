from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token
from db import users_col
import bcrypt

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json(silent=True) or {}

        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        if not name or not email or not password:
            return jsonify({"message": "Missing required fields"}), 400

        if users_col.find_one({"email": email}):
            return jsonify({"message": "User already exists"}), 400

        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

        user = {
            "name": name,
            "email": email,
            "password_hash": hashed_password,
            "role": "member"
        }

        users_col.insert_one(user)

        return jsonify({"message": "User registered successfully"}), 201

    except Exception as e:
        print("ERROR:", e)
        return jsonify({"message": "Registration failed"}), 500


@auth_bp.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json(silent=True) or {}

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message": "Missing email or password"}), 400

        user = users_col.find_one({"email": email})

        if not user:
            return jsonify({"message": "Invalid credentials"}), 401

        stored_hash = user.get("password_hash")

        if not stored_hash or not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
            return jsonify({"message": "Invalid credentials"}), 401

        access_token = create_access_token(
            identity=str(user["_id"]),
            additional_claims={"role": user.get("role", "member")}
        )

        return jsonify({"access_token": access_token}), 200

    except Exception as e:
        print("LOGIN ERROR:", e)
        return jsonify({"message": "Login failed"}), 500