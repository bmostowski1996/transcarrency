from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

test_routes = Blueprint("test", __name__)

# This will need to get adapted to the database side code
# Dummy user database
# Test
USERS = {
    "user@example.com": {
        "password": "password123",
        "id": 1
    }
}

@test_routes.route("/login", methods=["POST"])
def login(): 
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    user = USERS.get(email)

    if not user or user["password"] != password:
        return jsonify({"msg": "Invalid credentials"}), 401
    
    # Create JWT token
    access_token = create_access_token(identity=str(user["id"]))
    return jsonify(access_token=access_token), 200

@test_routes.route("/dashboard", methods=["GET"])
@jwt_required()
def protected():
    user_id = get_jwt_identity()
    return jsonify(message="Welcome!", user_id=user_id)