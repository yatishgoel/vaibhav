import json
from match_txt import find_text_in_pdf


def extract_results_from_gemini_response(
    response, lease_abstraction_questions: dict, pdf_url: str
):
    """
    Extracts the relevant results from the Gemini response.
    """
    response_dict = json.loads(response.text)
    collated_results = []
    for key in lease_abstraction_questions.keys():
        collated_results.append(
            {
                "question": lease_abstraction_questions[key],
                "answer": response_dict[f"lease_{key}_answer"],
                "pdf_highlight": find_text_in_pdf(
                    pdf_url=pdf_url, search_text=response_dict[f"lease_{key}_line"]
                ),
            }
        )
    # Process the response_dict to extract relevant information
    return collated_results
