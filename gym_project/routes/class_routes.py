from flask import Blueprint, jsonify, request
from bson import ObjectId
from db import classes_col

class_bp = Blueprint('classes', __name__)

# =========================
# GET ALL CLASSES
# =========================
@class_bp.route('/classes', methods=['GET'])
def get_classes():
    try:
        classes = []

        for c in classes_col.find():
            classes.append({
                "id": str(c["_id"]),
                "title": c.get("title"),
                "type": c.get("type"),
                "instructor": c.get("instructor"),
                "capacity": c.get("capacity"),
                "location": c.get("location"),
                "start_time": c.get("start_time"),
                "duration_mins": c.get("duration_mins")
            })

        return jsonify(classes), 200

    except Exception as e:
        print("GET CLASSES ERROR:", e)
        return jsonify({"message": "Failed to load classes"}), 500


# =========================
# SEARCH CLASSES
# =========================
@class_bp.route('/classes/search', methods=['GET'])
def search_classes():
    try:
        text = request.args.get('text', '')

        query = {
            "$or": [
                {"title": {"$regex": text, "$options": "i"}},
                {"type": {"$regex": text, "$options": "i"}},
                {"instructor": {"$regex": text, "$options": "i"}}
            ]
        }

        results = []

        for c in classes_col.find(query):
            results.append({
                "id": str(c["_id"]),
                "title": c.get("title"),
                "type": c.get("type"),
                "instructor": c.get("instructor"),
                "capacity": c.get("capacity"),
                "location": c.get("location"),
                "start_time": c.get("start_time"),
                "duration_mins": c.get("duration_mins")
            })

        return jsonify(results), 200

    except Exception as e:
        print("SEARCH ERROR:", e)
        return jsonify({"message": "Search failed"}), 500


# =========================
# CREATE CLASS
# =========================
@class_bp.route('/classes', methods=['POST'])
def create_class():
    try:
        data = request.get_json()

        gym_class = {
            "title": data.get("title"),
            "type": data.get("type"),
            "instructor": data.get("instructor"),
            "capacity": data.get("capacity"),
            "location": data.get("location"),
            "start_time": data.get("start_time"),
            "duration_mins": data.get("duration_mins")
        }

        result = classes_col.insert_one(gym_class)

        return jsonify({
            "message": "Class created successfully",
            "id": str(result.inserted_id)
        }), 201

    except Exception as e:
        print("CREATE CLASS ERROR:", e)
        return jsonify({"message": "Failed to create class"}), 500


# =========================
# DELETE CLASS
# =========================
@class_bp.route('/classes/<class_id>', methods=['DELETE'])
def delete_class(class_id):
    try:
        result = classes_col.delete_one({"_id": ObjectId(class_id)})

        if result.deleted_count == 0:
            return jsonify({"message": "Class not found"}), 404

        return jsonify({"message": "Class deleted successfully"}), 200

    except Exception as e:
        print("DELETE CLASS ERROR:", e)
        return jsonify({"message": "Failed to delete class"}), 500

# =========================
# UPDATE CLASS
# =========================
@class_bp.route('/classes/<class_id>', methods=['PUT'])
def update_class(class_id):
    try:
        data = request.get_json()

        updated_data = {
            "title": data.get("title"),
            "type": data.get("type"),
            "instructor": data.get("instructor"),
            "capacity": data.get("capacity"),
            "location": data.get("location"),
            "start_time": data.get("start_time"),
            "duration_mins": data.get("duration_mins")
        }

        result = classes_col.update_one(
            {"_id": ObjectId(class_id)},
            {"$set": updated_data}
        )

        if result.matched_count == 0:
            return jsonify({"message": "Class not found"}), 404

        return jsonify({"message": "Class updated successfully"}), 200

    except Exception as e:
        print("UPDATE CLASS ERROR:", e)
        return jsonify({"message": "Failed to update class"}), 500