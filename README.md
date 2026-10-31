# CampusShield AI — Safe & Production-Aware Student Support Assistant (Assignment 2)

[![Next.js 14](https://img.shields.io/badge/Frontend-Next.js%2014-black?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![LangGraph](https://img.shields.io/badge/Agent%20Core-LangGraph%200.0.51-blue)](https://langchain-ai.github.io/langgraph/)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%20%7C%203.12-3776AB?logo=python)](https://python.org)
[![Unit Tests](https://img.shields.io/badge/Pytest%20Suite-36%2F36%20Passed-brightgreen)](backend/tests/)
[![Production Audit](https://img.shields.io/badge/Safety%20Audit-20%2F20%20Passed%20(100%25)-success)](scripts/verify_system.py)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

> **Agentic AI Engineering — Assignment 2 Project Submission**  
> *"Engineered for production safety, code-level role-based access control (RBAC), human-in-the-loop approvals, and immutable forensic audit trails."*

---

## 🛡️ Assignment 2 Core Privacy & Safety Scenarios

CampusShield AI extends the baseline support agent (Assignment 1) into a production-grade institutional system satisfying all 5 key assignment scenarios:

| # | Required Scenario | Implementation & Defense Mechanism | Safety Guarantee |
|---|---|---|---|
| **1** | **Own Fee / Scholarship Status** | Logged-in student queries own tuition balance or active scholarship grant (`get_fee_status`, `get_scholarship_status`). | **ALLOWED** with full grounded financial records. |
| **2** | **Cross-Student Access Attempt** | Logged-in student attempts to view another student's fee/scholarship/bank records by ID or name (e.g., Kabir Rao). | **BLOCKED (UNAUTHORIZED)** by Python code-level RBAC (not prompt dependent). Audited in `SecurityAuditLog`. |
| **3** | **Sensitive Mutation Request** | Student requests high-impact record modification (fee refund bank account, emergency grant, programme change). | **STAGED FOR APPROVAL** in `ActionApproval` table (`status="pending"`). Zero immediate mutations occur. |
| **4** | **Human Rejection Guarantee** | Administrator rejects staged action in the Approval Center (`/app/approvals`). | **0 MUTATIONS EXECUTED**. Database records remain 100% unaltered. Audited as `REJECTED`. |
| **5** | **Zero-Leakage Secret Scrubbing** | User pastes OTP, passwords, or credentials in prompt messages. | **SCRUBBED & EXCLUDED** from model context, traces, and persistent memory. |

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph Client["Next.js 14 Web Application (Port 3000)"]
        Chat["Student Chat UI & Inline Approval Cards"]
        ApprovalsPage["HITL Approval Center (/app/approvals)"]
        AuditPage["Security Audit Trail (/app/audit)"]
        EvalPage["Comparative Evaluation (/app/evaluation)"]
    end

    subgraph Server["FastAPI Backend (Port 8000)"]
        API["REST Router /api/v1"]
        AuthMiddleware["Session Auth & RBAC Guard"]
        
        subgraph LangGraph["LangGraph State Machine (Guarded DAG)"]
            Validate["1. Validate & Sanitize\n(Purge OTPs & Passwords)"]
            RBACGuard["2. Code-Level RBAC Guard\n(Block Cross-Student Queries)"]
            IntentRouter["3. Guarded Intent Router\n(Map to Verified Tool / Staging)"]
            
            subgraph Tools["guarded tool execution"]
                FeeTool["get_fee_status\n(Student Ledger)"]
                SchTool["get_scholarship_status\n(Fellowship Grants)"]
                StageTool["stage_sensitive_action\n(ActionApproval Ledger)"]
                PolicyTool["search_student_policy\n(Heading-Preserving BM25)"]
            end
            
            Synthesize["4. Evidence-Grounded Synthesis\n(Strict Citations / Refusal)"]
            AuditNode["5. Audit Logger\n(SecurityAuditLog Ledger)"]
        end
        
        DB[(Local SQLite Ledger / Traces DB)]
    end

    Chat -->|Async HTTP / Bearer Auth| API
    ApprovalsPage -->|Decide Approve / Reject| API
    AuditPage -->|Fetch Audit Ledger| API
    EvalPage -->|Fetch Comparison Matrix| API

    API --> AuthMiddleware --> LangGraph
    Validate --> RBACGuard --> IntentRouter
    IntentRouter -->|self_fee| FeeTool --> Synthesize
    IntentRouter -->|self_scholarship| SchTool --> Synthesize
    IntentRouter -->|sensitive_action| StageTool --> Synthesize
    IntentRouter -->|policy| PolicyTool --> Synthesize
    Synthesize --> AuditNode --> DB
```

---

## 📊 Comparative Evaluation Matrix (Assignment 1 vs Assignment 2)

As specified in the syllabus, CampusShield AI delivers measurable verification proving safety and security gains over baseline:

| Dimension | Assignment 1 (Baseline) | Assignment 2 (CampusShield) | Observed Delta | Safety Status |
|---|---|---|---|---|
| **Task Accuracy** | 90.0% (Standard queries) | 100.0% (Standard + safe fallbacks) | **+10.0%** | **IMPROVED** |
| **Cross-Student Privacy** | Not Enforced (Shared Tenant Assumption) | 100% Blocked with `SecurityAuditLog` | **+100% Defense** | **CRITICAL PASS** |
| **Sensitive Action Safety** | Immediate / Unbounded Execution | 100% Staged (Requires HITL Decision) | **100% Protected** | **SECURE** |
| **Rejection Mutation Guarantee** | N/A (Mutations were direct) | Exactly 0 Database Mutations | **0 Leaks** | **CRITICAL PASS** |
| **Security Audit Trail** | None (Trace table only) | Immutable `SecurityAuditLog` Ledger | **Full Ledger** | **COMPREHENSIVE** |
| **P95 Latency** | 112 ms | 118 ms | **+6 ms only** | **OPTIMAL** |
| **Token Budget & Secrets** | Bounded context | Bounded context + Zero Secret Leakage | **Scrubbed** | **OPTIMAL** |

---

## 🚀 Dedicated Web Interfaces

1. **Student Assistant Chat (`/app`)**: Interactive conversation with visual indicators, inline approval cards for sensitive transactions, and live evidence drawer.
2. **Human-in-the-Loop Approval Center (`/app/approvals`)**: Queue of pending refund bank updates, scholarship grants, and degree changes with instant Approve/Reject controls.
3. **Security & Authorization Audit Trail (`/app/audit`)**: Real-time forensic ledger tracking every access attempt, decision (`ALLOWED`, `BLOCKED_UNAUTHORIZED`, `PENDING_APPROVAL`, `APPROVED`, `REJECTED`), and actor ID.
4. **Agent Verification & Comparative Benchmark (`/app/evaluation`)**: Head-to-head comparison table (Assignment 1 vs Assignment 2) alongside the 10-case deterministic benchmark suite with interactive charts.

---

## 🛠️ Verification & Test Suite

### 1. Pytest Unit & Security Test Suite (36 Tests)
```bash
cd backend
python3 -m pytest tests/ -v
# Output: 36 passed in 1.53s
```

### 2. Comprehensive 20-Check Production Verification Script
```bash
python3 scripts/verify_system.py
# Output: ALL 20 SYSTEM & ASSIGNMENT 2 SAFETY VERIFICATION CHECKS PASSED (100%)!
```

---

## 💻 How to Run Locally

### Prerequisites
- Python 3.11 or 3.12
- Node.js 18+ and npm

### 1. Start the Backend API
```bash
cd backend
# With virtual environment active:
python3 -m uvicorn app.main:app --reload --port 8000
```
API Documentation will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Web Application will be accessible at: `http://localhost:3000`

---

## 👨‍💻 Author & Submission Details
- **Student Name**: Dhruv Patel
- **Repository**: `CampusShield-AI` (Assignment 2)
- **Course**: Agentic AI Engineering
- **Baseline Repo**: `CampusPilot-AI` (Assignment 1)
