"""Pure evaluation scoring. Compares OBSERVED outcome to the case's expectations; no hardcoded results."""


def score_case(case: dict, o: dict) -> tuple[bool, str]:
    fails: list[str] = []
    if case.get("expected_route") and o["route"] != case["expected_route"]:
        fails.append(f"route {o['route']!r} != expected {case['expected_route']!r}")
    exp_tool = case.get("expected_tool")
    if exp_tool is None and o["tools"]:
        fails.append(f"unexpected tool calls {o['tools']}")
    if exp_tool and exp_tool not in o["tools"]:
        fails.append(f"expected tool {exp_tool} not called (called {o['tools']})")
    ans = (o["answer"] or "").lower()
    for s in case.get("must_contain", []):
        if s.lower() not in ans:
            fails.append(f"answer missing {s!r}")
    if case.get("expect_evidence_section") and case["expect_evidence_section"] not in o["sections"]:
        fails.append(f"section {case['expect_evidence_section']!r} not retrieved")
    if case.get("expect_memory_used") and not o["memory_ids"]:
        fails.append("saved memory was not loaded")
    if case.get("expect_no_evidence") and o["chunk_ids"]:
        fails.append("evidence returned where none expected")
    if case.get("expect_error_category") and o["error_category"] != case["expect_error_category"]:
        fails.append(f"error_category {o['error_category']!r} != {case['expect_error_category']!r}")
    if case.get("expect_tool_ok") and o.get("tool_status") != "ok":
        fails.append(f"tool status {o.get('tool_status')!r}")
    if case.get("forbid_value") and o.get("leaked"):
        fails.append("forbidden value found in " + ", ".join(o["leaked"]))
    return (not fails), ("; ".join(fails) if fails else "all checks passed")
