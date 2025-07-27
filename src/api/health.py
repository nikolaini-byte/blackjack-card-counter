"""
Health check endpoints for monitoring the application status.
"""
from flask import jsonify, current_app
from flask.views import MethodView

class HealthCheck(MethodView):
    """Health check endpoint."""
    
    def get(self):
        ""
        Health check endpoint.
        ---
        tags:
          - Health
        responses:
          200:
            description: Application is healthy
            schema:
              type: object
              properties:
                status:
                  type: string
                  example: "healthy"
                version:
                  type: string
                  example: "1.0.0"
        """
        return jsonify({
            "status": "healthy",
            "version": "1.0.0"
        }), 200

def register_routes(blueprint):
    """Register health check routes."""
    view = HealthCheck.as_view('health')
    blueprint.add_url_rule('/health', view_func=view)
