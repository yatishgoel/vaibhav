# Firebase PDF Upload Script

This Python script uploads PDF files to Firebase Storage and returns public URLs that can be used in your applications.

## Prerequisites

1. **Python 3.7+** installed on your system
2. **Firebase service account JSON file** (already provided: `vaibhav-ca072-firebase-adminsdk-fbsvc-94a84da87b.json`)
3. **Python dependencies** installed

## Installation

1. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

   Or install manually:

   ```bash
   pip install firebase-admin==6.4.0 google-cloud-storage==2.10.0
   ```

2. **Ensure the Firebase service account JSON file is in the same directory** as the script:
   ```
   vaibhav-ca072-firebase-adminsdk-fbsvc-94a84da87b.json
   ```

## Usage

### Basic Upload

Upload a PDF file and get a public URL:

```bash
python upload_pdf_to_firebase.py /path/to/your/document.pdf
```

### Upload with Custom Filename

Upload with a custom filename:

```bash
python upload_pdf_to_firebase.py /path/to/your/document.pdf my_lease_agreement
```

### List Uploaded PDFs

View all uploaded PDFs in Firebase Storage:

```bash
python upload_pdf_to_firebase.py --list
```

## Examples

### Example 1: Upload a lease document

```bash
python upload_pdf_to_firebase.py ~/Documents/lease_agreement.pdf
```

**Output:**

```
✅ Firebase initialized successfully
📤 Uploading lease_agreement.pdf to Firebase Storage...
✅ Upload successful!
📁 Firebase path: pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf
🔗 Public URL: https://storage.googleapis.com/vaibhav-ca072.appspot.com/pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf

🎉 Success! Your PDF is now accessible at:
🔗 https://storage.googleapis.com/vaibhav-ca072.appspot.com/pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf
```

### Example 2: Upload with custom name

```bash
python upload_pdf_to_firebase.py ~/Documents/contract.pdf sample_lease_2024
```

**Output:**

```
✅ Firebase initialized successfully
📤 Uploading contract.pdf to Firebase Storage...
✅ Upload successful!
📁 Firebase path: sample_lease_2024.pdf
🔗 Public URL: https://storage.googleapis.com/vaibhav-ca072.appspot.com/sample_lease_2024.pdf
```

### Example 3: List all uploaded PDFs

```bash
python upload_pdf_to_firebase.py --list
```

**Output:**

```
✅ Firebase initialized successfully

📚 Uploaded PDFs in 'pdfs/':
--------------------------------------------------------------------------------
📄 pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf
   Size: 2.45 MB
   Created: 2024-12-20 14:30:52+00:00
   URL: https://storage.googleapis.com/vaibhav-ca072.appspot.com/pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf
--------------------------------------------------------------------------------
📄 sample_lease_2024.pdf
   Size: 1.78 MB
   Created: 2024-12-20 14:35:21+00:00
   URL: https://storage.googleapis.com/vaibhav-ca072.appspot.com/sample_lease_2024.pdf
--------------------------------------------------------------------------------
```

## Features

### 🚀 **Core Features**

- ✅ Upload PDF files to Firebase Storage
- ✅ Generate public URLs automatically
- ✅ Custom filename support
- ✅ Automatic file validation (PDF only)
- ✅ Unique filename generation with timestamps
- ✅ File metadata tracking
- ✅ List all uploaded PDFs
- ✅ Delete PDFs from storage

### 🔒 **Security & Validation**

- ✅ File type validation (PDF only)
- ✅ File existence checking
- ✅ Error handling and logging
- ✅ Service account authentication

### 📊 **File Management**

- ✅ Automatic folder organization (`pdfs/` directory)
- ✅ File size tracking
- ✅ Upload timestamp recording
- ✅ Original filename preservation

## File Structure

```
your-project/
├── upload_pdf_to_firebase.py          # Main upload script
├── requirements.txt                    # Python dependencies
├── vaibhav-ca072-firebase-adminsdk-fbsvc-94a84da87b.json  # Firebase credentials
└── Firebase_PDF_Upload_README.md      # This documentation
```

## Using in Your React App

Once you upload a PDF using this script, you can use the public URL in your React PDF viewer:

```jsx
// Example usage in your PDFViewer component
const pdfUrl =
  "https://storage.googleapis.com/vaibhav-ca072.appspot.com/pdfs/lease_agreement_20241220_143052_a1b2c3d4.pdf";

<PDFViewer file={pdfUrl} scrollToCoordinates={{ x: 25, y: 50, page: 1 }} />;
```

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError: No module named 'firebase_admin'**

   ```bash
   pip install firebase-admin google-cloud-storage
   ```

2. **FileNotFoundError: Firebase service account file not found**

   - Ensure `vaibhav-ca072-firebase-adminsdk-fbsvc-94a84da87b.json` is in the same directory
   - Check file permissions

3. **ValueError: File must be a PDF**

   - Ensure your file has a `.pdf` extension
   - Check that the file is actually a PDF

4. **Permission denied errors**
   - Check Firebase project permissions
   - Verify service account has Storage Admin role

### Getting Help

If you encounter issues:

1. Check the error message for specific details
2. Verify Firebase credentials are correct
3. Ensure PDF file exists and is readable
4. Check internet connectivity for Firebase uploads

## Firebase Storage Organization

Uploaded files are organized as:

```
vaibhav-ca072.appspot.com/
└── pdfs/
    ├── lease_agreement_20241220_143052_a1b2c3d4.pdf
    ├── contract_20241220_144522_b5c6d7e8.pdf
    └── sample_lease_2024.pdf  # Custom named files
```

## Advanced Usage

### Programmatic Usage

You can also use the `FirebasePDFUploader` class in your own Python scripts:

```python
from upload_pdf_to_firebase import FirebasePDFUploader

# Initialize uploader
uploader = FirebasePDFUploader()

# Upload a PDF
public_url = uploader.upload_pdf('/path/to/file.pdf', 'my_custom_name')
print(f"Uploaded to: {public_url}")

# List all PDFs
pdf_list = uploader.list_uploaded_pdfs()

# Delete a PDF
uploader.delete_pdf('pdfs/unwanted_file.pdf')
```

---

**Happy uploading! 🚀**
