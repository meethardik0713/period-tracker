"""
Backend API Tests for Luna Period Tracker
Tests: /api/health, /api/ai-insights endpoints
"""
import pytest
import requests
import os
from pathlib import Path
from dotenv import load_dotenv

# Load frontend .env to get EXPO_PUBLIC_BACKEND_URL
frontend_env = Path(__file__).parent.parent.parent / 'frontend' / '.env'
load_dotenv(frontend_env)

BASE_URL = os.environ.get('EXPO_PUBLIC_BACKEND_URL', '').rstrip('/')
if not BASE_URL:
    raise ValueError("EXPO_PUBLIC_BACKEND_URL not found in environment")

class TestHealthEndpoint:
    """Health check endpoint tests"""

    def test_health_endpoint_returns_200(self):
        """Test that health endpoint returns 200 OK"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_health_endpoint_returns_ok_status(self):
        """Test that health endpoint returns correct JSON structure"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data, "Response should contain 'status' field"
        assert data["status"] == "ok", f"Expected status 'ok', got {data.get('status')}"


class TestAIInsightsEndpoint:
    """AI insights endpoint tests"""

    def test_ai_insights_returns_200_with_valid_data(self):
        """Test AI insights endpoint with valid cycle data"""
        payload = {
            "cycle_day": 14,
            "phase": "Ovulation",
            "cycle_length": 28,
            "period_length": 5,
            "recent_moods": ["happy", "calm"],
            "recent_symptoms": ["cramps"],
            "days_until_next_period": 14
        }
        response = requests.post(
            f"{BASE_URL}/api/ai-insights",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"

    def test_ai_insights_returns_insight_field(self):
        """Test that AI insights response contains insight field"""
        payload = {
            "cycle_day": 1,
            "phase": "Period",
            "cycle_length": 28,
            "period_length": 5,
            "recent_moods": ["tired"],
            "recent_symptoms": ["cramps", "headache"],
            "days_until_next_period": 28
        }
        response = requests.post(
            f"{BASE_URL}/api/ai-insights",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insight" in data, "Response should contain 'insight' field"
        assert isinstance(data["insight"], str), "Insight should be a string"
        assert len(data["insight"]) > 0, "Insight should not be empty"

    def test_ai_insights_with_minimal_data(self):
        """Test AI insights with minimal required data"""
        payload = {
            "cycle_day": 1,
            "phase": "Unknown",
            "cycle_length": 28,
            "period_length": 5,
            "recent_moods": [],
            "recent_symptoms": [],
            "days_until_next_period": 0
        }
        response = requests.post(
            f"{BASE_URL}/api/ai-insights",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "insight" in data
        assert len(data["insight"]) > 0

    def test_ai_insights_with_empty_body(self):
        """Test AI insights endpoint with empty request body"""
        response = requests.post(
            f"{BASE_URL}/api/ai-insights",
            json={},
            headers={"Content-Type": "application/json"}
        )
        # Should still return 200 with default values from Pydantic model
        assert response.status_code == 200
        data = response.json()
        assert "insight" in data


class TestRootEndpoint:
    """Root API endpoint test"""

    def test_root_endpoint_returns_200(self):
        """Test that root API endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200

    def test_root_endpoint_returns_message(self):
        """Test that root endpoint returns expected message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Luna" in data["message"]
