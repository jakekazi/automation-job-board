import json

import httpx

from app.config import settings


class AIService:
    def __init__(self):
        self.api_key = settings.openrouter_api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "anthropic/claude-3-haiku-20240307"

    async def _call_llm(self, messages: list, max_tokens: int = 1000) -> str:
        """Make a request to OpenRouter API."""
        if not self.api_key:
            raise ValueError("OpenRouter API key not configured")

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self.model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                },
                timeout=30.0,
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"]

    async def generate_job_description(
        self, brief: str, requirements: list[str] | None = None
    ) -> dict:
        """Generate a full job description from a brief input."""
        req_text = ", ".join(requirements) if requirements else "not specified"

        prompt = f"""You are helping create a job posting for an AI automation task board where sponsors post automation requests for apprentices.

Given this brief description: "{brief}"
Requirements/skills mentioned: {req_text}

Generate a professional job description with:
1. A clear, concise title (max 60 characters)
2. A detailed description (2-3 paragraphs explaining the project, deliverables, and ideal outcome)
3. Specific requirements list (bullet points of skills/experience needed)

Return your response as JSON with these fields:
{{
    "title": "...",
    "description": "...",
    "requirements": "..."
}}

Keep the tone professional but approachable. Focus on automation/AI tasks."""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_llm(messages)

        # Parse JSON from response
        try:
            # Try to extract JSON if wrapped in markdown code blocks
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0]
            elif "```" in result:
                result = result.split("```")[1].split("```")[0]
            return json.loads(result.strip())
        except json.JSONDecodeError:
            # Fallback: return as-is in description
            return {
                "title": brief[:60] if len(brief) > 60 else brief,
                "description": result,
                "requirements": "",
            }

    async def generate_cover_letter(
        self,
        job_title: str,
        job_description: str,
        apprentice_name: str,
        apprentice_bio: str | None,
    ) -> str:
        """Help write a cover letter for a job application."""
        bio_text = apprentice_bio if apprentice_bio else "No bio provided"

        prompt = f"""Write a brief, professional cover letter for an automation job application.

Job: {job_title}
Job Description: {job_description[:500]}...

Applicant Name: {apprentice_name}
Applicant Background: {bio_text}

Write a cover letter that:
1. Shows enthusiasm for the specific project
2. Highlights relevant experience (infer from bio if possible)
3. Demonstrates understanding of the requirements
4. Is 3-4 short paragraphs

Keep it professional but personable. Don't be overly formal or use cliches."""

        messages = [{"role": "user", "content": prompt}]
        return await self._call_llm(messages)

    async def match_jobs_for_apprentice(
        self,
        apprentice_bio: str | None,
        jobs: list[dict],
    ) -> list[dict]:
        """Score and rank jobs for an apprentice based on their profile."""
        if not jobs:
            return []

        bio_text = apprentice_bio if apprentice_bio else "No bio available"
        jobs_text = "\n".join(
            [f"- Job ID {j['id']}: {j['title']} - {j['description'][:200]}..." for j in jobs]
        )

        prompt = f"""You are a job matching assistant for an AI automation platform.

Apprentice profile: {bio_text}

Available jobs:
{jobs_text}

For each job, provide a match score (0.0 to 1.0) based on how well the apprentice's background matches the job requirements.

Return JSON array:
[{{"job_id": "...", "score": 0.85, "reason": "Brief explanation"}}]

Only include jobs with score >= 0.5. Sort by score descending."""

        messages = [{"role": "user", "content": prompt}]
        result = await self._call_llm(messages)

        try:
            if "```json" in result:
                result = result.split("```json")[1].split("```")[0]
            elif "```" in result:
                result = result.split("```")[1].split("```")[0]
            return json.loads(result.strip())
        except json.JSONDecodeError:
            return []


# Singleton instance
ai_service = AIService()
