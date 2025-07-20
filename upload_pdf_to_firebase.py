#!/usr/bin/env python3
"""
Firebase PDF Upload Script

This script uploads PDF files to Firebase Storage and returns public URLs.
Usage: python upload_pdf_to_firebase.py <pdf_file_path>
"""

import os
import sys
import uuid
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, storage

class FirebasePDFUploader:
    def __init__(self, service_account_path="vaibhav-ca072-firebase-adminsdk-fbsvc-94a84da87b.json"):
        """
        Initialize Firebase app with service account credentials
        
        Args:
            service_account_path (str): Path to the Firebase service account JSON file
        """
        self.service_account_path = service_account_path
        self.app = None
        self.bucket = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK"""
        try:
            # Check if Firebase app is already initialized
            if not firebase_admin._apps:
                cred = credentials.Certificate(self.service_account_path)
                # Try different bucket configurations
                bucket_options = [
                    'vaibhav-ca072.appspot.com',
                    'vaibhav-ca072.firebasestorage.app',
                    'vaibhav-ca072'
                ]
                
                # Initialize without specifying bucket first
                self.app = firebase_admin.initialize_app(cred)
            else:
                self.app = firebase_admin.get_app()
            
            # Try to get storage bucket with different names
            bucket_names = [
                'vaibhav-ca072.appspot.com',
                'vaibhav-ca072.firebasestorage.app', 
                'gs://vaibhav-ca072.appspot.com',
                'gs://vaibhav-ca072.firebasestorage.app'
            ]
            
            bucket_found = False
            for bucket_name in bucket_names:
                try:
                    if bucket_name.startswith('gs://'):
                        clean_name = bucket_name.replace('gs://', '')
                        self.bucket = storage.bucket(clean_name)
                    else:
                        self.bucket = storage.bucket(bucket_name)
                    
                    # Test bucket access by listing (this will fail if bucket doesn't exist)
                    list(self.bucket.list_blobs(max_results=1))
                    print(f"✅ Firebase initialized successfully with bucket: {bucket_name}")
                    bucket_found = True
                    break
                except Exception as e:
                    print(f"⚠️  Bucket {bucket_name} not accessible: {str(e)[:100]}...")
                    continue
            
            if not bucket_found:
                print("\n❌ No accessible storage bucket found!")
                print("\n📝 To fix this, you need to:")
                print("1. Go to https://console.firebase.google.com/")
                print("2. Select your project 'vaibhav-ca072'")
                print("3. Go to 'Storage' in the left menu")
                print("4. Click 'Get started' if Storage is not enabled")
                print("5. Choose your storage location (e.g., us-central1)")
                print("6. Set security rules to allow read/write")
                print("\nAfter enabling Storage, try running the script again.")
                raise Exception("Firebase Storage not configured")
            
        except Exception as e:
            print(f"❌ Error initializing Firebase: {e}")
            raise
    
    def upload_pdf(self, pdf_file_path, custom_filename=None):
        """
        Upload PDF file to Firebase Storage
        
        Args:
            pdf_file_path (str): Local path to the PDF file
            custom_filename (str, optional): Custom filename for the uploaded file
            
        Returns:
            str: Public download URL of the uploaded PDF
        """
        try:
            # Validate file exists and is PDF
            if not os.path.exists(pdf_file_path):
                raise FileNotFoundError(f"PDF file not found: {pdf_file_path}")
            
            if not pdf_file_path.lower().endswith('.pdf'):
                raise ValueError("File must be a PDF (.pdf extension)")
            
            # Generate filename
            if custom_filename:
                filename = custom_filename if custom_filename.endswith('.pdf') else f"{custom_filename}.pdf"
            else:
                base_name = os.path.splitext(os.path.basename(pdf_file_path))[0]
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                unique_id = str(uuid.uuid4())[:8]
                filename = f"pdfs/{base_name}_{timestamp}_{unique_id}.pdf"
            
            print(f"📤 Uploading {os.path.basename(pdf_file_path)} to Firebase Storage...")
            
            # Create blob and upload file
            blob = self.bucket.blob(filename)
            
            # Set metadata
            blob.metadata = {
                'contentType': 'application/pdf',
                'uploadedAt': datetime.now().isoformat(),
                'originalName': os.path.basename(pdf_file_path),
                'fileSize': str(os.path.getsize(pdf_file_path))
            }
            
            # Upload file
            with open(pdf_file_path, 'rb') as file_data:
                blob.upload_from_file(file_data, content_type='application/pdf')
            
            # Make blob publicly accessible
            blob.make_public()
            
            # Get public URL
            public_url = blob.public_url
            
            print(f"✅ Upload successful!")
            print(f"📁 Firebase path: {filename}")
            print(f"🔗 Public URL: {public_url}")
            
            return public_url
            
        except Exception as e:
            print(f"❌ Error uploading PDF: {e}")
            raise
    
    def list_uploaded_pdfs(self, prefix="pdfs/"):
        """
        List all uploaded PDFs in Firebase Storage
        
        Args:
            prefix (str): Folder prefix to filter files
            
        Returns:
            list: List of blob information
        """
        try:
            blobs = self.bucket.list_blobs(prefix=prefix)
            pdf_files = []
            
            print(f"\n📚 Uploaded PDFs in '{prefix}':")
            print("-" * 80)
            
            for blob in blobs:
                if blob.name.endswith('.pdf'):
                    file_info = {
                        'name': blob.name,
                        'size': blob.size,
                        'created': blob.time_created,
                        'public_url': blob.public_url if hasattr(blob, 'public_access_prevention') else blob.public_url
                    }
                    pdf_files.append(file_info)
                    
                    size_mb = blob.size / (1024 * 1024) if blob.size else 0
                    print(f"📄 {blob.name}")
                    print(f"   Size: {size_mb:.2f} MB")
                    print(f"   Created: {blob.time_created}")
                    print(f"   URL: {blob.public_url}")
                    print("-" * 80)
            
            return pdf_files
            
        except Exception as e:
            print(f"❌ Error listing PDFs: {e}")
            return []
    
    def delete_pdf(self, firebase_path):
        """
        Delete a PDF from Firebase Storage
        
        Args:
            firebase_path (str): Path of the file in Firebase Storage
        """
        try:
            blob = self.bucket.blob(firebase_path)
            blob.delete()
            print(f"🗑️ Deleted: {firebase_path}")
            
        except Exception as e:
            print(f"❌ Error deleting PDF: {e}")
            raise


def main():
    """Main function to handle command line usage"""
    if len(sys.argv) < 2:
        print("📖 Usage: python upload_pdf_to_firebase.py <pdf_file_path> [custom_filename]")
        print("\nExamples:")
        print("  python upload_pdf_to_firebase.py /path/to/document.pdf")
        print("  python upload_pdf_to_firebase.py /path/to/document.pdf my_lease_agreement")
        print("  python upload_pdf_to_firebase.py --list")
        print("  python upload_pdf_to_firebase.py --setup-help")
        sys.exit(1)
    
    # Handle special commands
    if sys.argv[1] == "--list":
        uploader = FirebasePDFUploader()
        uploader.list_uploaded_pdfs()
        return
    
    if sys.argv[1] == "--setup-help":
        print("\n🔧 Firebase Storage Setup Instructions:")
        print("=" * 50)
        print("1. Go to https://console.firebase.google.com/")
        print("2. Select your project 'vaibhav-ca072'")
        print("3. Click 'Storage' in the left sidebar")
        print("4. Click 'Get started' button")
        print("5. Choose 'Start in production mode'")
        print("6. Select a storage location (e.g., us-central1)")
        print("7. Click 'Done'")
        print("\n📋 Security Rules (set these in the Rules tab):")
        print("rules_version = '2';")
        print("service firebase.storage {")
        print("  match /b/{bucket}/o {")
        print("    match /{allPaths=**} {")
        print("      allow read, write: if true;")
        print("    }")
        print("  }")
        print("}")
        print("\n⚠️  Note: The above rules allow public access. For production,")
        print("   implement proper authentication and authorization rules.")
        return
    
    # Upload PDF
    pdf_path = sys.argv[1]
    custom_filename = sys.argv[2] if len(sys.argv) > 2 else None
    
    try:
        uploader = FirebasePDFUploader()
        public_url = uploader.upload_pdf(pdf_path, custom_filename)
        
        print(f"\n🎉 Success! Your PDF is now accessible at:")
        print(f"🔗 {public_url}")
        
    except Exception as e:
        print(f"\n💥 Upload failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main() 