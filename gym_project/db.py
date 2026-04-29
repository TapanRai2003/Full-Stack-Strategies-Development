from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017")

# Select database
db = client["gym_api"]

# Collections used in the project
users_col = db["users"]
classes_col = db["classes"]
bookings_col = db["bookings"]