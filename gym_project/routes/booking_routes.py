from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
from datetime import datetime, timezone
from db import bookings_col, classes_col, users_col

booking_bp = Blueprint('bookings', __name__)


@booking_bp.route('/bookings', methods=['POST'])
@jwt_required()
def create_booking():
    try:
        data = request.get_json(silent=True) or {}

        print("========== BOOKING REQUEST START ==========")
        print("BOOKING REQUEST DATA:", data)

        class_id = data.get('class_id')
        member_id = get_jwt_identity()
        claims = get_jwt()
        token_role = claims.get("role", "member")

        print("CLASS ID:", class_id)
        print("MEMBER ID FROM TOKEN:", member_id)
        print("ROLE FROM TOKEN:", token_role)

        if token_role == "admin":
            return jsonify({
                "message": "Admins cannot book classes. Please use a member account."
            }), 403

        if not class_id:
            return jsonify({"message": "Class ID is required"}), 400

        class_obj_id = ObjectId(class_id)
        member_obj_id = ObjectId(member_id)

        gym_class = classes_col.find_one({"_id": class_obj_id})
        user = users_col.find_one({"_id": member_obj_id})

        print("FOUND CLASS:", gym_class)
        print("FOUND USER:", user)

        if not gym_class:
            return jsonify({"message": "Class not found"}), 404

        if not user:
            return jsonify({"message": "User not found"}), 404

        existing_booking = bookings_col.find_one({
            "class_id": class_obj_id,
            "member_id": member_obj_id,
            "status": "booked"
        })

        print("EXISTING BOOKING:", existing_booking)

        if existing_booking:
            return jsonify({"message": "You have already booked this class"}), 400

        booking = {
            "class_id": class_obj_id,
            "member_id": member_obj_id,

            # Clear user details for MongoDB clarity
            "member_name": user.get("name"),
            "member_email": user.get("email"),
            "member_role": user.get("role", "member"),

            # Clear class details for MongoDB clarity
            "class_title": gym_class.get("title"),
            "class_type": gym_class.get("type"),
            "class_instructor": gym_class.get("instructor"),
            "class_location": gym_class.get("location"),
            "class_start_time": gym_class.get("start_time"),

            # Source tracking
            "booking_source": "Angular Frontend",
            "booking_page": "Classes Page",
            "action": "booking_created",

            # Status and timestamps
            "status": "booked",
            "created_at": datetime.now(timezone.utc)
        }

        print("BOOKING DOCUMENT TO INSERT:", booking)

        result = bookings_col.insert_one(booking)

        print("BOOKING INSERTED ID:", result.inserted_id)
        print("========== BOOKING REQUEST END ==========")

        return jsonify({
            "message": "Class booked successfully",
            "booking_id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("BOOKING ERROR:", e)
        return jsonify({"message": "Booking failed"}), 500


@booking_bp.route('/bookings/me', methods=['GET'])
@jwt_required()
def get_my_bookings():
    try:
        member_id = ObjectId(get_jwt_identity())

        bookings = list(bookings_col.find({
            "member_id": member_id
        }))

        result = []

        for booking in bookings:
            gym_class = classes_col.find_one({
                "_id": booking["class_id"]
            })

            if gym_class:
                result.append({
                    "id": str(booking["_id"]),
                    "class_title": gym_class.get("title"),
                    "class_type": gym_class.get("type"),
                    "instructor": gym_class.get("instructor"),
                    "location": gym_class.get("location"),
                    "start_time": gym_class.get("start_time"),
                    "status": booking.get("status")
                })

        return jsonify(result), 200

    except Exception as e:
        print("GET BOOKINGS ERROR:", e)
        return jsonify({"message": "Failed to fetch bookings"}), 500


@booking_bp.route('/bookings/<booking_id>/cancel', methods=['PATCH'])
@jwt_required()
def cancel_booking(booking_id):
    try:
        member_id = ObjectId(get_jwt_identity())
        claims = get_jwt()
        role = claims.get("role", "member")

        print("========== CANCEL BOOKING START ==========")
        print("BOOKING ID:", booking_id)
        print("MEMBER ID:", member_id)
        print("ROLE:", role)

        booking = bookings_col.find_one({
            "_id": ObjectId(booking_id),
            "member_id": member_id,
            "status": "booked"
        })

        print("BOOKING FOUND BEFORE CANCEL:", booking)

        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        result = bookings_col.update_one(
            {"_id": ObjectId(booking_id)},
            {
                "$set": {
                    "status": "cancelled",
                    "cancelled_by": member_id,
                    "cancelled_by_role": role,
                    "cancellation_source": "Angular Frontend",
                    "cancellation_page": "My Bookings Page",
                    "action": "booking_cancelled",
                    "cancelled_at": datetime.now(timezone.utc)
                }
            }
        )

        print("CANCEL UPDATE MATCHED:", result.matched_count)
        print("CANCEL UPDATE MODIFIED:", result.modified_count)
        print("========== CANCEL BOOKING END ==========")

        return jsonify({"message": "Booking cancelled successfully"}), 200

    except Exception as e:
        print("CANCEL BOOKING ERROR:", e)
        return jsonify({"message": "Failed to cancel booking"}), 500