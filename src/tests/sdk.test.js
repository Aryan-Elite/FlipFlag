// SDK Evaluation Endpoint Tests
// Run with: node src/tests/sdk.test.js
//
// Before running:
// 1. Backend must be running on port 3001
// 2. Replace SDK_KEY with your real dev SDK key from the API Keys page
// 3. Set up flags in UI as described in each test

const SDK_KEY     = "ff_dev_e9224c9d"; // ← replace with your real key
const BASE_URL    = "http://localhost:3001";
const ENDPOINT    = `${BASE_URL}/api/sdk/flags`;

let passed = 0;
let failed = 0;

// ─── Helper ───────────────────────────────────────────────────────────────────

async function callSDK(sdkKey, userContext) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-SDK-Key": sdkKey,
    },
    body: JSON.stringify({ userContext }),
  });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(testName, condition, actual) {
  if (condition) {
    console.log(`  ✅ PASS — ${testName}`);
    passed++;
  } else {
    console.log(`  ❌ FAIL — ${testName}`);
    console.log(`     Got: ${JSON.stringify(actual)}`);
    failed++;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

async function testInvalidSDKKey() {
  console.log("\n📦 Test: Invalid SDK key");
  const { status, data } = await callSDK("ff_dev_wrongkey123", {});
  assert("returns 404", status === 404, status);
  assert("returns error message", !!data.error, data);
}

async function testMissingSDKKey() {
  console.log("\n📦 Test: Missing X-SDK-Key header");
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userContext: {} }),
  });
  const data = await res.json();
  assert("returns 401", res.status === 401, res.status);
  assert("returns error message", !!data.error, data);
}

async function testFlagOff() {
  console.log("\n📦 Test: Flag with kill switch OFF");
  console.log("   ⚠️  Make sure at least one flag is toggled OFF in the UI");
  const { status, data } = await callSDK(SDK_KEY, {
    userId: "user-1",
    attributes: { plan: "premium" },
  });
  assert("returns 200", status === 200, status);
  assert("response has flags object", typeof data.flags === "object", data);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
  const allFalseWhenOff = Object.values(data.flags).includes(false);
  assert("at least one flag is false (the disabled one)", allFalseWhenOff, data.flags);
}

async function testNoRulesNoRollout() {
  console.log("\n📦 Test: Flag ON, no rules, default_rollout = 0");
  console.log("   ⚠️  Flag should be enabled (toggle ON) with no rules and rollout slider at 0");
  const { status, data } = await callSDK(SDK_KEY, {
    userId: "user-1",
    attributes: { plan: "premium" },
  });
  assert("returns 200", status === 200, status);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

async function testRuleMatchNoRollout() {
  console.log("\n📦 Test: Rule matches user, no rollout → should return serve value");
  console.log("   ⚠️  Set up rule: plan IN [premium] → serve: true, no rollout");
  const { status, data } = await callSDK(SDK_KEY, {
    userId: "user-1",
    attributes: { plan: "premium" },
  });
  assert("returns 200", status === 200, status);
  assert("flags object exists", typeof data.flags === "object", data);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

async function testRuleNoMatch() {
  console.log("\n📦 Test: User does NOT match rule condition → falls to default");
  console.log("   ⚠️  Rule is plan IN [premium]. Send plan=free → should NOT match rule");
  const { status, data } = await callSDK(SDK_KEY, {
    userId: "user-1",
    attributes: { plan: "free" },
  });
  assert("returns 200", status === 200, status);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

async function testMissingUserId() {
  console.log("\n📦 Test: No userId passed, rule has rollout → should passthrough");
  console.log("   ⚠️  Rule should have a rollout % set. Without userId, rule is skipped.");
  const { status, data } = await callSDK(SDK_KEY, {
    attributes: { plan: "premium" },
  });
  assert("returns 200", status === 200, status);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

async function testEmptyUserContext() {
  console.log("\n📦 Test: Completely empty userContext");
  const { status, data } = await callSDK(SDK_KEY, {});
  assert("returns 200", status === 200, status);
  assert("flags object exists", typeof data.flags === "object", data);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

async function testResponseShape() {
  console.log("\n📦 Test: Response shape is correct");
  const { status, data } = await callSDK(SDK_KEY, {
    userId: "user-1",
    attributes: { plan: "premium" },
  });
  assert("returns 200", status === 200, status);
  assert("has 'flags' key", "flags" in data, data);
  assert("all flag values are booleans", Object.values(data.flags).every((v) => typeof v === "boolean"), data.flags);
  console.log(`   ℹ️  Flags received: ${JSON.stringify(data.flags)}`);
}

// ─── Run All ──────────────────────────────────────────────────────────────────

async function runAll() {
  console.log("🚀 FlipFlag SDK Endpoint Tests");
  console.log("================================");

  await testMissingSDKKey();
  await testInvalidSDKKey();
  await testResponseShape();
  await testFlagOff();
  await testNoRulesNoRollout();
  await testRuleMatchNoRollout();
  await testRuleNoMatch();
  await testMissingUserId();
  await testEmptyUserContext();

  console.log("\n================================");
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed === 0) console.log("🎉 All tests passed!");
  else console.log("⚠️  Some tests need attention — check the flag setup notes above each test.");
}

runAll();
