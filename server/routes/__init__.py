# routes/__init__.py

from .test_routes import test_routes

blueprints = [
    (test_routes, "/test")
]