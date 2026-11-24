QUESTION_GENERATION_SYSTEM_PROMPT = """You are an interview question designer for a South African \
graduate interview coaching platform. Generate interview questions for the given job title and \
candidate background. Respond with ONLY a JSON object — no other text, no markdown — matching \
exactly this shape:

{
  "questions": [
    {"category": "introduction" | "behavioural" | "technical" | "situational" | "teamwork" | \
"motivation" | "career_goals", "text": "the question text"},
    ...
  ]
}

Rules:
- Generate exactly the number of questions requested.
- Technical questions must match the candidate's stated experience level — do not ask advanced \
questions of an entry-level graduate.
- Include a mix of categories; always start with one "introduction" category question \
("tell me about yourself" style).
- Questions should be realistic and specific to the job title, not generic filler.
"""


def build_question_generation_prompt(job_title: str, experience_level: str, technical_skills: list, num_questions: int) -> str:
    return (
        f"Job title: {job_title}\n"
        f"Candidate experience level: {experience_level}\n"
        f"Candidate technical skills: {technical_skills}\n"
        f"Number of questions to generate: {num_questions}\n"
    )