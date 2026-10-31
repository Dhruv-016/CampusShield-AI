"""Server-side Groq wrapper. Keys are never logged or returned."""
from dataclasses import dataclass
from .config import settings

_override = None  # tests can inject a fake: fn(messages, max_tokens, temperature) -> LLMResult


class LLMError(Exception):
    def __init__(self, category: str):
        super().__init__(category)
        self.category = category


@dataclass
class LLMResult:
    text: str
    input_tokens: int | None = None
    output_tokens: int | None = None
    total_tokens: int | None = None


def set_override(fn):
    global _override
    _override = fn


def configured() -> bool:
    return _override is not None or bool(settings.groq_key and settings.groq_model)


def chat(messages: list[dict], max_tokens: int = 500, temperature: float = 0.2) -> LLMResult:
    if _override:
        return _override(messages, max_tokens, temperature)
    if not (settings.groq_key and settings.groq_model):
        raise LLMError("llm_not_configured")
    try:
        import groq
        client = groq.Groq(api_key=settings.groq_key, timeout=20.0, max_retries=1)
        r = client.chat.completions.create(model=settings.groq_model, messages=messages,
                                           max_tokens=max_tokens, temperature=temperature)
    except Exception as e:  # map provider errors to safe categories; never include the message (may echo secrets)
        name = type(e).__name__
        cat = {"APITimeoutError": "llm_timeout", "RateLimitError": "llm_rate_limited",
               "APIConnectionError": "llm_network_error", "AuthenticationError": "llm_auth_error",
               "NotFoundError": "llm_model_not_found", "BadRequestError": "llm_bad_request"}.get(name, "llm_provider_error")
        raise LLMError(cat) from None
    text = (r.choices[0].message.content or "").strip() if r.choices else ""
    u = getattr(r, "usage", None)
    return LLMResult(text, getattr(u, "prompt_tokens", None), getattr(u, "completion_tokens", None), getattr(u, "total_tokens", None))
