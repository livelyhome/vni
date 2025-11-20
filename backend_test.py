import requests
import sys
import json
from datetime import datetime
import base64
import io

class ConstructionAPITester:
    def __init__(self, base_url="https://construct-gallery-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.project_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, files=files, headers=headers)
                else:
                    headers['Content-Type'] = 'application/json'
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                headers['Content-Type'] = 'application/json'
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                except:
                    pass
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text[:200]}")

            return success, response.json() if response.content else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "ingusvaldis", "password": "mPa$$ISadmin#"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test invalid login credentials"""
        success, _ = self.run_test(
            "Invalid Login",
            "POST",
            "auth/login",
            401,
            data={"username": "wrong", "password": "wrong"}
        )
        return success

    def test_get_projects(self):
        """Test getting projects (public endpoint)"""
        success, response = self.run_test(
            "Get Projects",
            "GET",
            "projects",
            200
        )
        return success

    def test_create_project(self):
        """Test creating a new project"""
        project_data = {
            "title": "Test Construction Project",
            "description": "A test project for our construction business",
            "order": 1
        }
        success, response = self.run_test(
            "Create Project",
            "POST",
            "projects",
            200,
            data=project_data
        )
        if success and 'id' in response:
            self.project_id = response['id']
            print(f"   Project ID: {self.project_id}")
        return success

    def test_update_project(self):
        """Test updating a project"""
        if not self.project_id:
            print("❌ No project ID available for update test")
            return False
        
        update_data = {
            "title": "Updated Test Project",
            "description": "Updated description for test project"
        }
        success, _ = self.run_test(
            "Update Project",
            "PUT",
            f"projects/{self.project_id}",
            200,
            data=update_data
        )
        return success

    def test_upload_project_image(self):
        """Test uploading an image to a project"""
        if not self.project_id:
            print("❌ No project ID available for image upload test")
            return False

        # Create a simple test image (1x1 pixel PNG)
        test_image_data = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
        
        files = {'file': ('test.png', io.BytesIO(test_image_data), 'image/png')}
        
        success, _ = self.run_test(
            "Upload Project Image",
            "POST",
            f"projects/{self.project_id}/images",
            200,
            files=files
        )
        return success

    def test_get_about(self):
        """Test getting about section"""
        success, response = self.run_test(
            "Get About Section",
            "GET",
            "about",
            200
        )
        return success

    def test_update_about(self):
        """Test updating about section"""
        about_data = {
            "title": "About Our Construction Business",
            "content": "We are a family-owned construction business with years of experience in quality workmanship."
        }
        success, _ = self.run_test(
            "Update About Section",
            "PUT",
            "about",
            200,
            data=about_data
        )
        return success

    def test_submit_contact(self):
        """Test submitting contact form"""
        contact_data = {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890",
            "message": "I'm interested in your construction services. Please contact me."
        }
        success, _ = self.run_test(
            "Submit Contact Form",
            "POST",
            "contact",
            200,
            data=contact_data
        )
        return success

    def test_get_contacts(self):
        """Test getting contact submissions (admin only)"""
        success, _ = self.run_test(
            "Get Contact Submissions",
            "GET",
            "contact",
            200
        )
        return success

    def test_get_calendar_availability(self):
        """Test getting calendar availability"""
        success, _ = self.run_test(
            "Get Calendar Availability",
            "GET",
            "calendar/availability",
            200
        )
        return success

    def test_update_calendar_availability(self):
        """Test updating calendar availability"""
        calendar_data = {
            "dates": [
                {
                    "date": "2025-01-15",
                    "is_available": False,
                    "note": "Busy with another project"
                },
                {
                    "date": "2025-01-20",
                    "is_available": False,
                    "note": "Holiday"
                }
            ]
        }
        success, _ = self.run_test(
            "Update Calendar Availability",
            "PUT",
            "calendar/availability",
            200,
            data=calendar_data
        )
        return success

    def test_delete_project(self):
        """Test deleting a project"""
        if not self.project_id:
            print("❌ No project ID available for delete test")
            return False
        
        success, _ = self.run_test(
            "Delete Project",
            "DELETE",
            f"projects/{self.project_id}",
            200
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoints without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Project Creation",
            "POST",
            "projects",
            401,
            data={"title": "Unauthorized", "description": "Should fail"}
        )
        
        # Restore token
        self.token = original_token
        return success

def main():
    print("🏗️  Construction Business API Testing")
    print("=" * 50)
    
    tester = ConstructionAPITester()
    
    # Test sequence
    tests = [
        # Authentication tests
        ("Admin Login", tester.test_admin_login),
        ("Invalid Login", tester.test_invalid_login),
        
        # Public endpoints (no auth required)
        ("Get Projects", tester.test_get_projects),
        ("Get About", tester.test_get_about),
        ("Submit Contact", tester.test_submit_contact),
        ("Get Calendar", tester.test_get_calendar_availability),
        
        # Protected endpoints (require auth)
        ("Create Project", tester.test_create_project),
        ("Update Project", tester.test_update_project),
        ("Upload Image", tester.test_upload_project_image),
        ("Update About", tester.test_update_about),
        ("Get Contacts", tester.test_get_contacts),
        ("Update Calendar", tester.test_update_calendar_availability),
        
        # Security tests
        ("Unauthorized Access", tester.test_unauthorized_access),
        
        # Cleanup
        ("Delete Project", tester.test_delete_project),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if failed_tests:
        print(f"\n❌ Failed tests:")
        for test in failed_tests:
            print(f"   - {test}")
    else:
        print("\n✅ All tests passed!")
    
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"\n📈 Success rate: {success_rate:.1f}%")
    
    return 0 if len(failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())