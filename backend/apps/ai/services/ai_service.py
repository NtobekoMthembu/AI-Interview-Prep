import json

from django.conf import settings
from google import genai
from google.genai import types
from google.genai import errors as genai_errors

from apps.ai.prompts.resume_analysis import (
    RESUME_ANALYSIS_SYSTEM_PROMPT, build_resume_analysis_prompt,
)
from apps.ai.prompts.job_recommendation import (
    JOB_RECOMMENDATION_SYSTEM_PROMPT, build_job_recommendation_prompt,
)
from apps.ai.prompts.question_generation import (
    QUESTION_GENERATION_SYSTEM_PROMPT, build_question_generation_prompt,
)
from apps.ai.prompts.answer_evaluation import (
    ANSWER_EVALUATION_SYSTEM_PROMPT, build_answer_evaluation_prompt,
)


class AIServiceError(Exception):
    """Raised when the AI provider fails or returns something unusable."""


class AIService:
    """
    The one place in the codebase that talks to an AI provider.
    Backed by Google AI Studio (Gemini) via the current `google-genai` SDK.
    """

    def __init__(self):
        self._client = genai.Client(api_key=settings.GOOGLE_AI_API_KEY)

    def _generate_json(self, system_prompt: str, user_prompt: str, temperature: float) -> dict:
        try:
            response = self._client.models.generate_content(
                model=settings.AI_MODEL_NAME,
                contents=[system_prompt, user_prompt],
                config=types.GenerateContentConfig(
                    response_mime_type='application/json',
                    temperature=temperature,
                ),
            )
        except genai_errors.APIError as exc:
            raise AIServiceError(f'AI provider request failed: {exc}') from exc

        try:
            return json.loads(response.text)
        except (json.JSONDecodeError, TypeError, ValueError) as exc:
            raise AIServiceError(f'AI returned invalid JSON: {exc}') from exc

    def analyze_resume(self, resume_text: str) -> dict:
        return self._generate_json(
            RESUME_ANALYSIS_SYSTEM_PROMPT,
            build_resume_analysis_prompt(resume_text),
            temperature=0.3,
        )

    def recommend_jobs(self, candidate_context: dict) -> dict:
        return self._generate_json(
            JOB_RECOMMENDATION_SYSTEM_PROMPT,
            build_job_recommendation_prompt(candidate_context),
            temperature=0.4,
        )

    def generate_questions(self, job_title: str, experience_level: str, technical_skills: list, num_questions: int) -> dict:
        return self._generate_json(
            QUESTION_GENERATION_SYSTEM_PROMPT,
            build_question_generation_prompt(job_title, experience_level, technical_skills, num_questions),
            temperature=0.5,
        )

    def evaluate_answer(self, question_text: str, question_category: str, answer_text: str) -> dict:
        return self._generate_json(
            ANSWER_EVALUATION_SYSTEM_PROMPT,
            build_answer_evaluation_prompt(question_text, question_category, answer_text),
            temperature=0.3,
        )