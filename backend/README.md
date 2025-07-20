# PDF Analysis Backend

A FastAPI backend service that allows uploading PDF files and asking questions about their content using Google's Gemini AI.

## Setup

1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

3. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey) and add it to your `.env` file:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### 1. Analyze PDF with File Upload
**POST** `/analyze-pdf`

Upload a PDF file and ask a question about its content.

**Parameters:**
- `file`: PDF file (multipart/form-data)
- `question`: Question to ask about the PDF content (form field)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/analyze-pdf" \
  -F "file=@document.pdf" \
  -F "question=What is the main topic of this document?"
```

### 2. Analyze PDF with Base64
**POST** `/analyze-pdf-with-base64`

Alternative endpoint that accepts PDF as base64 string.

**Parameters:**
- `pdf_base64`: Base64 encoded PDF content (form field)
- `question`: Question to ask about the PDF content (form field)
- `filename`: Optional filename for reference (form field)

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/analyze-pdf-with-base64" \
  -F "pdf_base64=$(base64 -i document.pdf)" \
  -F "question=What is the main topic of this document?" \
  -F "filename=document.pdf"
```

## Response Format

Both endpoints return a JSON response with the following structure:

```json
{
  "status": "success",
  "question": "What is the main topic of this document?",
  "answer": "The main topic of this document is...",
  "file_name": "document.pdf"
}
```

## Error Handling

- Returns 400 for invalid file types (non-PDF files)
- Returns 500 for processing errors
- All errors include descriptive error messages

## Features

- PDF file validation
- Temporary file cleanup
- Comprehensive error handling
- Two different upload methods (direct file upload and base64)
- Integration with Google's Gemini AI for document analysis
