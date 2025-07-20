from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse
import google.generativeai as genai

from typing import Optional
from dotenv import load_dotenv

from google import genai
import httpx
import io

from combine_ai_pdf_results import extract_results_from_gemini_response
from extract_lease_details import make_ai_calling_assets_for_lease_abstraction

# Load environment variables
load_dotenv()

app = FastAPI()


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Optional[str] = None):
    return {"item_id": item_id, "q": q}


@app.get("/analyze-pdf")
async def analyze_pdf():
    """
    Upload a PDF file and ask a question about its content using Gemini.
    """
    long_context_pdf_path = "https://firebasestorage.googleapis.com/v0/b/smriti-ielts-website.appspot.com/o/lease02.pdf?alt=media&token=bf18e114-c283-4b0e-857b-8246e3d05837"
    try:
        # Read the PDF file content

        client = genai.Client(api_key="AIzaSyBitfLP4A6SO35qLerooM4xW5y5s7hxdM0")

        # Retrieve and upload the PDF using the File API
        doc_io = io.BytesIO(initial_bytes=httpx.get(long_context_pdf_path).content)

        sample_doc = client.files.upload(
            # You can pass a path or a file-like object here
            file=doc_io,
            config=dict(mime_type="application/pdf"),
        )

        lease_abstraction_questions = {
            "q_1": "What is the lease start date?",
            "q_2": "What is the lease end date?",
            "q_3": "What is the rent amount?",
            "q_4": "What are the renewal options?",
            "q_5": "What are the termination clauses?",
        }
        prompt, function_call_json = make_ai_calling_assets_for_lease_abstraction(
            lease_abstraction_questions
        )

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[sample_doc, prompt],
            config={
                "response_mime_type": "application/json",
                "response_schema": {
                    "type": "object",
                    "properties": function_call_json,
                },
            },
        )
        return JSONResponse(
            content={
                "status": "success",
                "extracted_results": extract_results_from_gemini_response(
                    response, lease_abstraction_questions, long_context_pdf_path
                ),
            }
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
