#!/usr/bin/env python3
"""
Backend API Testing for Santos Cleaning Solutions
Tests all API endpoints to ensure proper functionality
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class SantosCleaningAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}: PASSED {details}")
        else:
            print(f"❌ {name}: FAILED {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def test_health_check(self):
        """Test health check endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/health", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Status: {data.get('status', 'unknown')}, DB: {data.get('database', 'unknown')}"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("Health Check", success, details)
            return success
            
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_endpoint(self):
        """Test root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                details = f"Message: {data.get('message', 'No message')}"
            else:
                details = f"Status code: {response.status_code}"
                
            self.log_test("Root Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Root Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_contact_submission(self):
        """Test contact form submission"""
        try:
            contact_data = {
                "name": "Test User",
                "phone": "123-456-7890",
                "email": "test@test.com",
                "message": "This is a test message from backend testing",
                "sms_consent": True,
                "language": "en",
                "source": "backend_test"
            }
            
            response = requests.post(
                f"{self.base_url}/api/contact",
                json=contact_data,
                timeout=15
            )
            
            success = response.status_code in [200, 201]
            
            if success:
                data = response.json()
                details = f"Success: {data.get('success', False)}, ID: {data.get('id', 'No ID')}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
                
            self.log_test("Contact Submission", success, details)
            return success
            
        except Exception as e:
            self.log_test("Contact Submission", False, f"Exception: {str(e)}")
            return False

    def test_reviews_endpoint(self):
        """Test reviews endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/reviews", timeout=15)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                reviews_count = len(data.get('reviews', []))
                details = f"Reviews loaded: {reviews_count}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
                
            self.log_test("Reviews Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Reviews Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_services_endpoint(self):
        """Test services endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/services", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                services_count = len(data.get('services', []))
                details = f"Services loaded: {services_count}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
                
            self.log_test("Services Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Services Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_leads_endpoint(self):
        """Test leads listing endpoint"""
        try:
            response = requests.get(f"{self.base_url}/api/leads?limit=5", timeout=10)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                leads_count = len(data.get('leads', []))
                total = data.get('total', 0)
                details = f"Leads loaded: {leads_count}, Total: {total}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
                
            self.log_test("Leads Endpoint", success, details)
            return success
            
        except Exception as e:
            self.log_test("Leads Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_booking_submission(self):
        """Test booking submission"""
        try:
            booking_data = {
                "customer_name": "Test Customer",
                "email": "testcustomer@test.com",
                "phone": "123-456-7890",
                "service_type": "Deep Cleaning",
                "preferred_date": "2024-12-15",
                "preferred_time": "10:00 AM",
                "address": "123 Test Street, Marietta, GA 30060",
                "special_instructions": "Test booking from backend testing"
            }
            
            response = requests.post(
                f"{self.base_url}/api/bookings",
                json=booking_data,
                timeout=15
            )
            
            success = response.status_code in [200, 201]
            
            if success:
                data = response.json()
                details = f"Success: {data.get('success', False)}, Booking ID: {data.get('booking_id', 'No ID')}"
            else:
                details = f"Status code: {response.status_code}, Response: {response.text[:100]}"
                
            self.log_test("Booking Submission", success, details)
            return success
            
        except Exception as e:
            self.log_test("Booking Submission", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all API tests"""
        print("🧪 Starting Santos Cleaning Solutions API Tests")
        print("=" * 60)
        
        # Test basic connectivity first
        if not self.test_root_endpoint():
            print("❌ Root endpoint failed - backend may not be running")
            return False
            
        if not self.test_health_check():
            print("❌ Health check failed - database issues possible")
        
        # Test main functionality
        self.test_reviews_endpoint()
        self.test_services_endpoint()
        self.test_contact_submission()
        self.test_leads_endpoint()
        self.test_booking_submission()
        
        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed. Check the issues above.")
            return False

def main():
    """Main test execution"""
    tester = SantosCleaningAPITester()
    success = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())