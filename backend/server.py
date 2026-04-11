from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import uuid
from pathlib import Path
from pydantic import BaseModel
from typing import List
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")


class CycleInsightRequest(BaseModel):
    cycle_day: int = 1
    phase: str = "Unknown"
    cycle_length: int = 28
    period_length: int = 5
    recent_moods: List[str] = []
    recent_symptoms: List[str] = []
    days_until_next_period: int = 0


@api_router.get("/")
async def root():
    return {"message": "Luna API is running"}


@api_router.get("/health")
async def health():
    return {"status": "ok"}


@api_router.post("/ai-insights")
async def get_ai_insights(data: CycleInsightRequest):
    api_key = os.environ.get('EMERGENT_LLM_KEY')
    if not api_key:
        return {"insight": "Stay hydrated and listen to your body today! Remember to take it easy."}

    try:
        chat = LlmChat(
            api_key=api_key,
            session_id=f"luna-{uuid.uuid4().hex[:8]}",
            system_message="You are Luna, a caring women's health assistant. Provide brief, warm, personalized health insights based on cycle data. Keep responses to 2-3 sentences max. Be supportive and practical. Never provide medical diagnoses. Use a gentle, encouraging tone."
        ).with_model("openai", "gpt-4o-mini")

        prompt = f"""Cycle status:
- Day {data.cycle_day}, Phase: {data.phase}
- Cycle length: {data.cycle_length} days
- Next period in: {data.days_until_next_period} days
- Recent moods: {', '.join(data.recent_moods) if data.recent_moods else 'Not logged'}
- Recent symptoms: {', '.join(data.recent_symptoms) if data.recent_symptoms else 'None'}
Give a personalized wellness tip for today."""

        response = await chat.send_message(UserMessage(text=prompt))
        return {"insight": response}
    except Exception as e:
        logging.error(f"AI insight error: {e}")
        return {"insight": "Take care of yourself today! Stay hydrated and listen to what your body needs."}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
