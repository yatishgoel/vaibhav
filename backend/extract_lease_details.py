def make_function_call_json_for_lease_abstraction(lease_abstraction_questions: dict):
    function_call_json = {}
    for key, value in lease_abstraction_questions.items():
        function_call_json[f"lease_{key}_answer"] = {
            "type": "string",
            "description": f"Answer the question based on PDF content: {value}",
        }
        function_call_json[f"lease_{key}_line"] = {
            "type": "string",
            "description": "provide the exact text from the line that contains the answer. Do not include all the text... just a small snippet.",
        }
    return function_call_json


def generate_lease_abstraction_prompt(lease_abstraction_questions: dict):

    prompt = f"""
    You are an expert in lease abstraction. Given the following document, answer the questions below:
    Questions: {list(lease_abstraction_questions.values())  }
    For each answer, also provide a page number reference from the document and keywords from the paragraph that contains the answer to help find the exact location of the answer.
"""
    return prompt


def make_ai_calling_assets_for_lease_abstraction(lease_abstraction_questions: dict):
    """
    This function prepares the necessary assets for making an AI call for lease abstraction.
    It includes the prompt and the questions to be answered by the AI model.
    """

    prompt = generate_lease_abstraction_prompt(lease_abstraction_questions)

    return prompt, make_function_call_json_for_lease_abstraction(
        lease_abstraction_questions
    )
