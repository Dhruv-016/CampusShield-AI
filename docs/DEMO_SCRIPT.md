# Demo script
1. Open http://localhost:3000, click **Open Student Assistant**.
2. Ask "What is my current fee status?" → badge `get_fee_status: ok`, outstanding ₹25,000.
3. Ask "The payment portal failed. Can I pay on the next working day?" → source card *Payment Portal Problems*.
4. Ask "What is the hostel accommodation allotment policy?" → "couldn't verify", no sources.
5. Say "Remember that I prefer concise explanations." → saved. Click **New conversation**, ask "What does the handbook say about fee deadlines?" → "used 1 saved preference".
6. Say "My temporary OTP is 482913. Remember it for later." → "I won't save sensitive information…". Check **Memory** (absent) and **Traces** (shows `[REDACTED:otp]`).
7. **Traces**: open a trace; show timeline, tool calls, evidence IDs, latency, tokens ("unavailable" in limited mode).
8. **Evaluation**: Run Evaluation (local) → real per-case results. Live mode is blocked without a key.
9. Explain the README architecture. If the LLM is not configured, say so: limited mode is labelled in the UI.
