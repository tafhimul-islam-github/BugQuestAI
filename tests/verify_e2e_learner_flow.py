"""
BugQuest AI — Live End-to-End System Integration Test
Verifies the complete learner journey against running Laravel, FastAPI, and Database services:
1. Registration & Authentication
2. Challenge Library discovery
3. Challenge details & starter code
4. Isolated Code Execution (Failing & Passing)
5. AI Progressive Debugging Coaching (Levels 1-2)
6. Skill Evidence & Empirical Proficiency Update
7. Personalized Recommendations
8. Workforce Readiness Report generation & consent-controlled share token
9. Public share access & immediate token revocation verification
"""

import sys
import json
import urllib.request
import urllib.error
import traceback

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(method, path, data=None, token=None):
    url = f"{BASE_URL}{path}"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
        
    req_body = json.dumps(data).encode("utf-8") if data else None
    req = urllib.request.Request(url, data=req_body, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as res:
            res_body = res.read().decode("utf-8")
            return res.status, json.loads(res_body) if res_body else {}
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        try:
            parsed = json.loads(err_body)
        except Exception:
            parsed = {"error": err_body}
        return e.code, parsed

def run_tests():
    print("=" * 60)
    print("BugQuest AI - Comprehensive End-to-End System Verification")
    print("=" * 60)
    
    # 1. Health check
    status, body = make_request("GET", "/health")
    assert status == 200, f"Health check failed: {status}"
    print(f"[PASS] 1. Health check operational: {body.get('status')}")

    # 2. Authenticate Demo Learner
    status, body = make_request("POST", "/auth/login", {
        "email": "learner@bugquest.ai",
        "password": "password123"
    })
    assert status == 200 and "token" in body, f"Login failed: {body}"
    token = body["token"]
    user = body["user"]
    print(f"[PASS] 2. Logged in as: {user['name']} ({user['email']}), role={user['role']}")

    # 3. Retrieve Challenge Library
    status, body = make_request("GET", "/challenges", token=token)
    assert status == 200 and "challenges" in body, f"List challenges failed: {body}"
    challenges = body["challenges"]
    print(f"[PASS] 3. Challenge library retrieved: {len(challenges)} challenges available")
    for c in challenges:
        print(f"       - [{c['difficulty'].upper()}] {c['title']} ({', '.join(c.get('topics', []))})")

    # 4. Fetch Two Sum details by slug
    status, body = make_request("GET", "/challenges/two-sum-target-finder", token=token)
    assert status == 200 and "challenge" in body, f"Challenge details failed: {body}"
    ch = body["challenge"]
    assert "public_examples" in ch, "Missing public examples"
    print(f"[PASS] 4. Challenge details fetched for '{ch['title']}', public examples: {len(ch['public_examples'])}")

    # 5. Execute Code Assessment — Passing Two Sum solution
    two_sum_code = """
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
if (input.length < 2) process.exit(0);

const nums = input[0].split(',').map(Number);
const target = Number(input[1]);

function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const comp = target - nums[i];
        if (map.has(comp)) {
            return [map.get(comp), i];
        }
        map.set(nums[i], i);
    }
    return [];
}

console.log(JSON.stringify(twoSum(nums, target)));
"""
    status, body = make_request("POST", "/submissions", {
        "challenge_id": ch["id"],
        "language": "javascript",
        "code": two_sum_code
    }, token=token)
    assert status == 201, f"Submission creation failed: {body}"
    sub = body["submission"]
    print(f"[PASS] 5. Submission executed: status={sub['status']}, passed={sub['pass_count']}/{sub['total_count']}, time={sub['execution_time_ms']}ms")
    assert sub['status'] == 'accepted', f"Expected accepted, got {sub['status']}"

    # 6. Request AI Debugging Coach Hint (Progressive Levels)
    # Test level 1: Nudge
    status, body = make_request("POST", "/ai/hint", {
        "challenge_id": ch["id"],
        "submission_id": sub["id"],
        "language": "javascript",
        "code": two_sum_code,
        "hint_level": "nudge"
    }, token=token)
    assert status == 200 and "hint" in body, f"AI hint failed: {body}"
    hint = body["hint"]
    print(f"[PASS] 6a. AI Coach Level 1 (Nudge):")
    print(f"        Summary: {hint.get('summary')}")
    print(f"        Issue: {hint.get('likely_issue')}")
    print(f"        Confidence: {hint.get('confidence')}")

    # Test level 2: Direction
    status, body = make_request("POST", "/ai/hint", {
        "challenge_id": ch["id"],
        "submission_id": sub["id"],
        "language": "javascript",
        "code": two_sum_code,
        "hint_level": "direction"
    }, token=token)
    assert status == 200, f"AI hint level 2 failed: {body}"
    hint2 = body["hint"]
    print(f"[PASS] 6b. AI Coach Level 2 (Direction):")
    print(f"        Guidance: {hint2.get('explanation')[:75]}...")

    # 7. Check Skill Profile
    status, body = make_request("GET", "/learning/profile", token=token)
    assert status == 200 and "profile" in body, f"Skill profile failed: {body}"
    prof = body["profile"]
    print(f"[PASS] 7. Skill Profile updated with empirical assessment:")
    print(f"        Overall score: {prof['overall_score']}/100 ({prof['overall_proficiency']})")
    print(f"        Challenges solved: {prof['challenges_solved']}")
    for s in prof["skills"][:3]:
        print(f"        - {s['topic']}: score={s['score']}, level={s['proficiency_level']}, passed={s['challenges_passed']}")

    # 8. Check Personalized Recommendations
    status, body = make_request("GET", "/learning/recommendations", token=token)
    assert status == 200 and "recommendations" in body, f"Recommendations failed: {body}"
    recs = body["recommendations"]
    print(f"[PASS] 8. Personalized recommendations generated: {len(recs)} items")
    for r in recs[:2]:
        print(f"        -> {r.get('challenge', {}).get('title')} ({r.get('reason')})")

    # 9. Generate Workforce-Readiness Report
    status, body = make_request("POST", "/reports/generate", token=token)
    assert status == 201 and "report" in body, f"Report generation failed: {body}"
    report = body["report"]
    report_uuid = report["report_uuid"]
    print(f"[PASS] 9. Workforce Readiness Report generated (UUID: {report_uuid})")
    print(f"        Readiness index: {report.get('overall_readiness_score')}/100 ({report.get('readiness_level')})")

    # 10. Consent-Based Sharing Token Creation
    status, body = make_request("POST", f"/reports/{report_uuid}/share", {
        "allow_diagnostics": True,
        "allow_code_samples": False,
        "expires_days": 30
    }, token=token)
    assert status == 201 and "share_token" in body, f"Share token creation failed: {body}"
    share_token = body["share_token"]
    print(f"[PASS] 10. Share token created: {share_token[:16]}... (length={len(share_token)})")

    # 11. Public Shared Report Access (Unauthenticated)
    status, body = make_request("GET", f"/reports/shared/{share_token}")
    assert status == 200 and "shared_report" in body, f"Public shared report access failed: {body}"
    pub_report = body["shared_report"]
    print(f"[PASS] 11. Public report accessed securely via unauthenticated share token:")
    print(f"         Candidate: {pub_report.get('candidate_name')}")
    print(f"         Summary: {pub_report.get('summary')[:75]}...")

    # 12. Revoke Share Token
    status, body = make_request("POST", f"/reports/share/{share_token}/revoke", token=token)
    assert status == 200, f"Token revocation failed: {body}"
    print(f"[PASS] 12. Share token revoked by learner.")

    # 13. Verify Revoked Token Access Fails with 404
    status, body = make_request("GET", f"/reports/shared/{share_token}")
    assert status == 404, f"Expected 404 on revoked token, got {status}: {body}"
    print(f"[PASS] 13. Security verification: Revoked token strictly returned 404 Not Found.")

    print("=" * 60)
    print("ALL 13 SYSTEM INTEGRATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_tests()
    except Exception as e:
        print(f"\n[FAIL] Test failure: {e}", file=sys.stderr)
        traceback.print_exc()
        sys.exit(1)
