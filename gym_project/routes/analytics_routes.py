from flask import Blueprint, jsonify, make_response
from flask_jwt_extended import jwt_required, get_jwt
from db import bookings_col, users_col, classes_col

analytics_bp = Blueprint("analytics", __name__)

@analytics_bp.route("/analytics/popular-classes", methods=['GET'])
@jwt_required()
def popular_classes():
    if get_jwt().get("role") != "admin":
        return make_response(jsonify({"error": "admin only"}), 403)

    pipeline = [
        {"$match": {"status": "booked"}},
        {"$group": {"_id": "$class_id", "bookings_count": {"$sum": 1}}},
        {"$sort": {"bookings_count": -1}},
        {"$lookup": {
            "from": "classes",
            "localField": "_id",
            "foreignField": "_id",
            "as": "class"
        }},
        {"$unwind": "$class"},
        {"$project": {
            "_id": 0,
            "class_id": {"$toString": "$_id"},
            "bookings_count": 1,
            "title": "$class.title",
            "type": "$class.type",
            "instructor": "$class.instructor"
        }}
    ]

    results = list(bookings_col.aggregate(pipeline))
    return make_response(jsonify(results), 200)


@analytics_bp.route("/analytics/summary", methods=['GET'])
def get_summary():
    try:
        total_users = users_col.count_documents({})
        total_classes = classes_col.count_documents({})
        total_bookings = bookings_col.count_documents({})
        active_bookings = bookings_col.count_documents({"status": "booked"})
        cancelled_bookings = bookings_col.count_documents({"status": "cancelled"})

        return make_response(jsonify({
            "total_users": total_users,
            "total_classes": total_classes,
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "cancelled_bookings": cancelled_bookings
        }), 200)

    except Exception as e:
        print("SUMMARY ERROR:", e)
        return make_response(jsonify({"message": "Failed to load summary"}), 500)