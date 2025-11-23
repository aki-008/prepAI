import os
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.schema.models import QuizOutput, QuizQuestion
from app.config import settings

client = OpenAI(
    base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    api_key="AIzaSyAIZJOjjq87FDmW9sVoTuvPkwnmfFWtfNE",
)

async def call_llm(prompt:str):
    try:
        response = client.chat.completions.create(
            # CRUCIAL: Use the LiteLLM format: 'gemini/gemini-2.5-pro'
            model="models/gemini-2.0-flash", 
            messages=[
                {"role": "user", "content": prompt}
            ],
            # Use the OpenAI parameter to request JSON output
            response_format={"type": "json_object"}, 
            temperature=0.7,
        )

        json_string = response.choices[0].message.content

        import json
        quiz_data = json.loads(json_string)
        wrapped_data = {"quiz": quiz_data}
        return QuizOutput.model_validate(wrapped_data)

    except Exception as e:
        print(f"Error calling LiteLLM/Gemini: {e}")
        raise e