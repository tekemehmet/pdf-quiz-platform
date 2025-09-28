import os
import json
from openai import OpenAI
from typing import List, Dict, Any

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_quiz_from_text(text: str, question_type: str = "multiple-choice") -> List[Dict[str, Any]]:
    """
    Uses an LLM to generate a quiz from extracted PDF text.
    Returns a list of questions with options and correct answers.
    """
    
    if question_type == "multiple-choice":
        prompt = f"""
        You are an educational assistant. Based on the following course material, 
        generate 5 multiple-choice questions. Return JSON in this exact structure:
        [
          {{
            "id": "1",
            "question": "What is the primary purpose of photosynthesis?",
            "options": ["To produce oxygen", "To convert light energy into chemical energy", "To absorb water", "To create chlorophyll"],
            "correctAnswer": 1,
            "explanation": "Photosynthesis converts light energy into chemical energy stored in glucose.",
            "type": "multiple-choice"
          }},
          ...
        ]

        Text:
        {text[:4000]}
        """
    else:  # open-ended
        prompt = f"""
        You are an educational assistant. Based on the following course material, 
        generate 5 open-ended questions. Return JSON in this exact structure:
        [
          {{
            "id": "1",
            "question": "Explain the process of photosynthesis and its importance.",
            "options": [],
            "correctAnswer": 0,
            "explanation": "A comprehensive answer should include: the conversion of light energy to chemical energy, the role of chlorophyll, and the importance for ecosystems.",
            "type": "open-ended"
          }},
          ...
        ]

        Text:
        {text[:4000]}
        """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an educational assistant that generates quiz questions from course material. Always return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
        )

        content = response.choices[0].message.content
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            print("[LLM] Failed to parse JSON. Raw content:", content)
            return []
    except Exception as e:
        print(f"[LLM] Error generating quiz: {e}")
        return []
