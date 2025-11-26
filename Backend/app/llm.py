import os
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.schema.models import QuizOutput, QuizQuestion
from app.config import settings
from openai import AsyncOpenAI

client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)

async def call_llm(prompt:str):
    try:
        response = client.chat.completions.create(
            # CRUCIAL: Use the LiteLLM format: 'gemini/gemini-2.5-pro'
            model="openai/gpt-oss-20b", 
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



async def stream_chat(messages:List[dict], context:str):
    system_instruction = {
        "role": "system", 
        "content": "You are a helpful AI assistant. Answer the user's question strictly based on the provided context."
    }
    
    conversation_history = [msg.copy() for msg in messages]

    if conversation_history and conversation_history[-1]['role'] == 'user':
        last_user_msg = conversation_history[-1]
        # Rewrite the content to: Context + \n\n + Question
        last_user_msg['content'] = (
            f"Here is the context/notes you must use:\n"
            f"---------------------\n"
            f"{context}\n"
            f"---------------------\n\n"
            f"User Question: {last_user_msg['content']}"
        )
    else:
        # Fallback: If for some reason there is no user message, add one.
        conversation_history.append({
            "role": "user", 
            "content": f"Context:\n{context}\n\nPlease analyze this."
        })

    # 3. Combine System + Modified User History
    full_history = [system_instruction] + conversation_history

    try:
        # Ensure you are using the async_client initialized earlier
        stream = await client.chat.completions.create(
            model="openai/gpt-oss-20b", # Recommended for speed/quality on Groq
            messages=full_history,
            temperature=0.7,
            stream=True 
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        print(f"Error in chat stream: {e}")
        yield f"Error: {str(e)}"