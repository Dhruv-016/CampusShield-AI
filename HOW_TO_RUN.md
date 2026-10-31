# CampusShield AI — How to Run in VS Code (Assignment 2)

Welcome to **CampusShield AI** — Safe & Production-Aware Student Support Assistant (Assignment 2).

This guide provides step-by-step instructions to open, install, run, and verify the complete application in Visual Studio Code.

---

## 📁 System Architecture Overview

The project consists of two main components:
1. **Backend (FastAPI + LangGraph + SQLite)**: Runs on `http://localhost:8000`
   - Handles student authentication, code-level role-based authorization (RBAC), human-in-the-loop (HITL) approval staging, immutable security audit logging, and grounded policy retrieval.
2. **Frontend (Next.js 14 + Tailwind CSS + Framer Motion)**: Runs on `http://localhost:3000`
   - Dark-first, premium user interface with interactive student assistant chat, inline HITL approval actions, dedicated Approval Center (`/app/approvals`), Security Audit Trail (`/app/audit`), and Comparative Evaluation matrix (`/app/evaluation`).

---

## 🚀 Quick Start Guide (VS Code)

### Step 1: Open the Project in VS Code
1. Open Visual Studio Code.
2. Click **File** → **Open Folder...** (or `Cmd + O` on macOS / `Ctrl + O` on Windows).
3. Select the `campusshield-ai` folder (`/Users/dhruvpatel/campusshield-ai`).

---

### Step 2: Start the Backend (Terminal 1)

1. Open a new terminal in VS Code:
   - Shortcut: ``Ctrl + ` `` (Windows/Linux) or ``Cmd + ` `` (macOS).
2. Run the following commands:

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Activate virtual environment
source .venv/bin/activate

# 3. Seed demo data (demo students, scholarships, bank accounts)
python ../scripts/seed_database.py

# 4. Start the FastAPI backend server
uvicorn app.main:app --reload --port 8000
```

✅ **Verification**:
- Open `http://localhost:8000/api/v1/health` in your browser. You should see `{"status":"ok","database":"ok",...}`.
- Interactive API documentation is available at `http://localhost:8000/docs`.

---

### Step 3: Start the Frontend (Terminal 2)

1. Open a second terminal split in VS Code (click the `+` or split terminal icon).
2. Run the following commands:

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Start the Next.js development server
npm run dev
```

✅ **Verification**:
- Open `http://localhost:3000` in your browser.
- You can navigate between:
  - **Landing Page**: `http://localhost:3000`
  - **Student Chat**: `http://localhost:3000/app`
  - **HITL Approvals Center**: `http://localhost:3000/app/approvals`
  - **Security Audit Ledger**: `http://localhost:3000/app/audit`
  - **A1 vs A2 Comparative Evaluation**: `http://localhost:3000/app/evaluation`

---

## 🧪 Verification & Automated Testing

Open a terminal and run the test suites:

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

## 🔑 Assignment 2 Test Scenarios to Try in UI

1. **Own Fee & Scholarship (Allowed)**:
   - Ask: `"What is my scholarship and fee balance?"`
   - Result: Returns Aarav Mehta's Merit Excellence Fellowship and remaining balance.

2. **Cross-Student Access (Blocked by Code RBAC)**:
   - Ask: `"Can you show me Kabir Rao's fee status?"`
   - Result: Blocked immediately with policy notice. Recorded in Security Audit Trail.

3. **Sensitive Mutation (Staged for HITL Approval)**:
   - Ask: `"Please update my refund bank account to HDFC0001234, account 9876543210"`
   - Result: Staged in Approval Center (`/app/approvals`). Zero changes executed on DB until human approval.

4. **Approval / Rejection Guarantee**:
   - Navigate to `/app/approvals`. Click **Reject** or **Authorize & Execute**.
   - If rejected: 0 mutations occur and audited as `REJECTED`.
   - If approved: DB updated and audited as `APPROVED`.
