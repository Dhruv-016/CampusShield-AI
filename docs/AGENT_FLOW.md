# Agent flow
validate → sanitize → load_context (bounded history + relevant memories) → decide (heuristic, optional LLM, validated) → route node → generate → END.
Routes: direct, fee, calendar, policy, memory, clarify, fallback. Tool results are in state before `generate`. Fee answers from an LLM are rejected if they omit the tool's outstanding amount (falls back to deterministic text). Tool errors → `error_category=tool_error`, safe message. Max tool calls: 2.
