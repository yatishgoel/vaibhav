import fitz
import requests
from io import BytesIO
from rapidfuzz import fuzz


def download_pdf(url):
    response = requests.get(url)
    response.raise_for_status()  # Raise error if download fails
    return BytesIO(response.content)


def find_text_in_pdf(pdf_url: str, search_text: str):
    file_stream = download_pdf(pdf_url)
    doc = fitz.open(stream=file_stream, filetype="pdf")
    # for page_num in range(len(doc)):
    result = {
        "page": 2,
        "coordinates": {
            "x0": 50,
            "y0": 100,
            # "x1": 200,
            # "y1": 150,
            "width": 150,
            "height": 50,
        },
        "matched_text": "1st June 2024 or date of actual handover which",
        "similarity": 85,  # Example similarity score
    }  ## Dummy data

    for page_num in range(len(doc)):
        page = doc[page_num]

        blocks = page.get_text("blocks")

        threshold = 70  # Similarity threshold for matching
        for block in blocks:
            block_text = block[4].lower()
            similarity = fuzz.partial_ratio(search_text, block_text)

            if similarity >= threshold:
                x0 = max(block[0] - 20, 10)
                y0 = max(block[1] - 20, 10)
                x1 = min(block[2] + 20, page.rect.width - 10)
                y1 = min(block[3] + 20, page.rect.height - 10)
                result = {
                    "page": page_num + 1,
                    "coordinates": {
                        "x0": x0,
                        "y0": y0,
                        # "x1": x1,
                        # "y1": y1,
                        "width": x1 - x0,
                        "height": y1 - y0,
                    },
                    "matched_text": block[4],
                    "similarity": similarity,
                }
    return result
    # Download and open the PDF
