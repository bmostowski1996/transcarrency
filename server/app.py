from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from datetime import timedelta

from routes import blueprints

app = Flask(__name__)

# Secret key for signing the JWTs
app.config["JWT_SECRET_KEY"] = "foo"
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=1)

jwt = JWTManager(app)

# Register blueprint
# Dynamically register all blueprints
for bp, prefix in blueprints:
    app.register_blueprint(bp, url_prefix=prefix)

if __name__ == "__main__":
    app.run(debug=True)