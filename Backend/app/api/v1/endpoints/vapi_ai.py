from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from typing import Optional
from .prompts import Interviewer_prompt
from app.schema.models import VapiConfigRequest
from app.config import settings

router = APIRouter()



@router.post("/get-vapi-config")
async def get_vapi_config(config: VapiConfigRequest):

    system_prompt   = Interviewer_prompt.format(name = config.name,
    job_role = config.job_role,
    experience = config.experience,
    level = config.level)

    return{
        "assistantId": "1184587d-21d7-48f4-8e82-623a2e574324", 
        "overrides": {
            "variableValues": {
                "name": config.name,
                "job_role": config.job_role
            },
            "model": {
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    }
                ]
            }
        }
    }