<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use Illuminate\Database\Seeder;

class RealWorldDebuggingChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $challenges = [
            // -----------------------------------------------------------------
            // Quest 1: Shopping Cart Double Discount
            // -----------------------------------------------------------------
            [
                'slug' => 'cart-double-discount-bug',
                'title' => 'E-Commerce Cart Applies Discount Twice on Session Reload',
                'difficulty' => 'beginner',
                'category' => 'logic_state',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 20,
                'description' => "Customers report that when they refresh or reopen their shopping cart checkout session, percentage discount coupons get deducted a second time from the total, causing checkout pricing discrepancies.",
                'bug_report' => [
                    'issue_title' => 'Coupon discount deducted twice when calculating cart totals from serialized state',
                    'symptoms' => 'Applying a $20 discount on a $100 cart yields $80. After reloading the cart state from storage, the total becomes $60 instead of remaining $80.',
                    'expected_behavior' => 'Cart recalculation should be idempotent. Subtotal minus discount should only apply the discount once regardless of how many times totals are calculated.',
                    'actual_behavior' => 'In `src/cart.js`, `recalculate()` subtracts the discount from `this.subtotal` which was already discounted during state restoration.',
                    'reproduction_steps' => [
                        '1. Add item ($100.00) to Cart instance.',
                        '2. Apply coupon code "SAVE20" (20% off).',
                        '3. Serialize cart to session and restore it.',
                        '4. Call cart.recalculateTotal(). Total is $60.00 instead of $80.00.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/cart.js` or `src/pricing.js`. Do not modify test runner files.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/cart.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { calculateDiscount } = require('./pricing');

class ShoppingCart {
  constructor() {
    this.items = [];
    this.coupon = null;
    this.subtotal = 0;
    this.total = 0;
  }

  addItem(id, name, price, quantity = 1) {
    this.items.push({ id, name, price, quantity });
    this.recalculate();
  }

  applyCoupon(code, rate) {
    this.coupon = { code, rate };
    this.recalculate();
  }

  // BUG: recalculate updates this.subtotal by subtracting discount,
  // so next time it runs, it subtracts the discount again from an already-discounted subtotal!
  recalculate() {
    // Correct baseline should sum up raw items first
    let rawItemTotal = 0;
    for (const item of this.items) {
      rawItemTotal += item.price * item.quantity;
    }

    // BUGGY CODE: It mutates this.subtotal repeatedly
    if (this.coupon) {
      const discount = calculateDiscount(rawItemTotal, this.coupon.rate);
      this.subtotal = rawItemTotal - discount; // BUG: subtotal should be raw total, total should be discounted
      this.total = this.subtotal - discount;   // Double deduction!
    } else {
      this.subtotal = rawItemTotal;
      this.total = rawItemTotal;
    }
  }

  toJSON() {
    return {
      items: this.items,
      coupon: this.coupon,
      subtotal: this.subtotal,
      total: this.total,
    };
  }

  static fromJSON(data) {
    const cart = new ShoppingCart();
    cart.items = data.items || [];
    cart.coupon = data.coupon || null;
    cart.subtotal = data.subtotal || 0;
    cart.total = data.total || 0;
    return cart;
  }
}

module.exports = { ShoppingCart };
JS
                    ],
                    [
                        'path' => 'src/pricing.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
function calculateDiscount(baseAmount, percentageRate) {
  if (!percentageRate || percentageRate <= 0) return 0;
  const discount = (baseAmount * percentageRate) / 100;
  return Math.round(discount * 100) / 100;
}

module.exports = { calculateDiscount };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { ShoppingCart } = require('../src/cart');

const tests = [];

function runTest(name, isHidden, fn) {
  const start = Date.now();
  try {
    fn();
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'passed',
      passed: true,
      duration_ms: Date.now() - start
    });
  } catch (err) {
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'failed',
      passed: false,
      error: err.message,
      stack: err.stack,
      duration_ms: Date.now() - start
    });
  }
}

// Visible Test 1: Single item without coupon
runTest('Cart calculates single item subtotal and total accurately', false, () => {
  const cart = new ShoppingCart();
  cart.addItem('item-1', 'Mechanical Keyboard', 100, 1);
  if (cart.subtotal !== 100) throw new Error(`Expected subtotal 100, got ${cart.subtotal}`);
  if (cart.total !== 100) throw new Error(`Expected total 100, got ${cart.total}`);
});

// Visible Test 2: Applying coupon once
runTest('Cart applies 20% coupon correctly on first application', false, () => {
  const cart = new ShoppingCart();
  cart.addItem('item-1', 'Keyboard', 100, 1);
  cart.applyCoupon('SAVE20', 20);
  if (cart.subtotal !== 100) throw new Error(`Expected subtotal to remain raw 100, got ${cart.subtotal}`);
  if (cart.total !== 80) throw new Error(`Expected total to be 80, got ${cart.total}`);
});

// Visible Test 3: Idempotent recalculation after state restore (THE BUG)
runTest('Recalculate total after session restore does not deduct discount twice', false, () => {
  const cart = new ShoppingCart();
  cart.addItem('item-1', 'Keyboard', 100, 1);
  cart.applyCoupon('SAVE20', 20);
  
  // Re-run recalculation (mimics page refresh)
  cart.recalculate();
  if (cart.total !== 80) {
    throw new Error(`Double discount defect detected: Expected total 80 after recalculation, but got ${cart.total}`);
  }
});

// Hidden Test 4: Multiple items with quantity and coupon
runTest('Multiple items with quantity and 15% discount', true, () => {
  const cart = new ShoppingCart();
  cart.addItem('item-a', 'USB Cable', 10, 2); // 20
  cart.addItem('item-b', 'Monitor', 200, 1);  // 200 => total 220
  cart.applyCoupon('SUMMER15', 15);           // 15% of 220 = 33 => total 187
  cart.recalculate();
  if (cart.total !== 187) throw new Error(`Expected total 187, got ${cart.total}`);
  if (cart.subtotal !== 220) throw new Error(`Expected subtotal 220, got ${cart.subtotal}`);
});

console.log('BUGQUEST_REPORT_START');
console.log(JSON.stringify({ tests }));
console.log('BUGQUEST_REPORT_END');
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/cart.js',
                        'content' => <<<'JS'
const { calculateDiscount } = require('./pricing');

class ShoppingCart {
  constructor() {
    this.items = [];
    this.coupon = null;
    this.subtotal = 0;
    this.total = 0;
  }

  addItem(id, name, price, quantity = 1) {
    this.items.push({ id, name, price, quantity });
    this.recalculate();
  }

  applyCoupon(code, rate) {
    this.coupon = { code, rate };
    this.recalculate();
  }

  recalculate() {
    let rawItemTotal = 0;
    for (const item of this.items) {
      rawItemTotal += item.price * item.quantity;
    }

    this.subtotal = rawItemTotal;

    if (this.coupon) {
      const discount = calculateDiscount(rawItemTotal, this.coupon.rate);
      this.total = Math.max(0, rawItemTotal - discount);
    } else {
      this.total = rawItemTotal;
    }
  }

  toJSON() {
    return {
      items: this.items,
      coupon: this.coupon,
      subtotal: this.subtotal,
      total: this.total,
    };
  }

  static fromJSON(data) {
    const cart = new ShoppingCart();
    cart.items = data.items || [];
    cart.coupon = data.coupon || null;
    cart.subtotal = data.subtotal || 0;
    cart.total = data.total || 0;
    return cart;
  }
}

module.exports = { ShoppingCart };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['e_commerce', 'state_management', 'idempotency'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Inspect what subtotal represents',
                        'content' => 'Subtotal is typically the sum of items BEFORE discounts. What happens when this.subtotal is assigned a discounted value and then recalculated?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Examine line 27 in src/cart.js',
                        'content' => 'Notice how `this.subtotal = rawItemTotal - discount` and then `this.total = this.subtotal - discount` subtracts `discount` twice.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Separate raw subtotal from final net total',
                        'content' => 'Keep `this.subtotal = rawItemTotal` constant. Calculate `this.total = rawItemTotal - discount`. This ensures idempotent recalculations on repeated calls.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Complete solution pattern',
                        'content' => 'In `src/cart.js`, set `this.subtotal = rawItemTotal`. When `this.coupon` is present, set `this.total = Math.max(0, rawItemTotal - discount)`. Do not subtract discount from `this.subtotal`.'
                    ]
                ],
                'order_index' => 1,
            ],

            // -----------------------------------------------------------------
            // Quest 2: REST API Pagination Off-by-One
            // -----------------------------------------------------------------
            [
                'slug' => 'api-pagination-off-by-one',
                'title' => 'REST API Pagination Skips Final Record on Partial Pages',
                'difficulty' => 'intermediate',
                'category' => 'boundary_off_by_one',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 25,
                'description' => "Our users report that fetching paginated items from the `/api/records` endpoint misses the very last item when the total count is not an exact multiple of the page size.",
                'bug_report' => [
                    'issue_title' => 'Pagination slice end-boundary drops items when page size exceeds remaining records',
                    'symptoms' => 'For 11 records with page_size=5, Page 1 returns 5 items, Page 2 returns 5 items, but Page 3 returns empty array instead of 1 item.',
                    'expected_behavior' => 'Page 3 should return the 11th record and indicate `has_next_page: false`.',
                    'actual_behavior' => '`paginate()` computes `end = start + limit - 1` and passes it to array slice which requires non-inclusive upper bound.',
                    'reproduction_steps' => [
                        '1. Query dataset of 11 items with page=3 and limit=5.',
                        '2. Observe records returned is length 0 instead of length 1.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/paginator.js`.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/paginator.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
function paginate(items, page = 1, limit = 10) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / safeLimit);

  // BUG: Off-by-one error with slice boundary and page indexing
  // Array.prototype.slice(start, end) expects end to be non-inclusive index (start + safeLimit)
  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit - 1; // BUG: -1 causes slice to drop the last element on every page!

  const pageItems = items.slice(startIndex, endIndex);

  return {
    page: safePage,
    limit: safeLimit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next_page: safePage < totalPages,
    has_prev_page: safePage > 1,
    data: pageItems
  };
}

module.exports = { paginate };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { paginate } = require('../src/paginator');

const tests = [];

function runTest(name, isHidden, fn) {
  const start = Date.now();
  try {
    fn();
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'passed',
      passed: true,
      duration_ms: Date.now() - start
    });
  } catch (err) {
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'failed',
      passed: false,
      error: err.message,
      stack: err.stack,
      duration_ms: Date.now() - start
    });
  }
}

const mockDataset = Array.from({ length: 11 }, (_, i) => ({ id: i + 1, name: `Record ${i + 1}` }));

// Visible Test 1: Page 1 count
runTest('Page 1 returns exactly limit count', false, () => {
  const result = paginate(mockDataset, 1, 5);
  if (result.data.length !== 5) {
    throw new Error(`Expected 5 items on page 1, got ${result.data.length}`);
  }
  if (result.data[4].id !== 5) {
    throw new Error(`Expected 5th item id to be 5, got ${result.data[4]?.id}`);
  }
});

// Visible Test 2: Final partial page
runTest('Page 3 returns remaining 1 record for 11 items', false, () => {
  const result = paginate(mockDataset, 3, 5);
  if (result.data.length !== 1) {
    throw new Error(`Expected exactly 1 item on final page, got ${result.data.length}`);
  }
  if (result.data[0].id !== 11) {
    throw new Error(`Expected item id 11, got ${result.data[0].id}`);
  }
  if (result.has_next_page !== false) {
    throw new Error(`Expected has_next_page to be false on final page`);
  }
});

// Hidden Test 3: Exact multiple of page size
runTest('Dataset with exact multiple of limit (10 items / limit 5)', true, () => {
  const dataset = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
  const p1 = paginate(dataset, 1, 5);
  const p2 = paginate(dataset, 2, 5);
  if (p1.data.length !== 5 || p2.data.length !== 5) {
    throw new Error(`Expected 5 items on each page, got ${p1.data.length} and ${p2.data.length}`);
  }
  if (p2.has_next_page !== false) throw new Error('p2 should not have next page');
});

console.log('BUGQUEST_REPORT_START');
console.log(JSON.stringify({ tests }));
console.log('BUGQUEST_REPORT_END');
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/paginator.js',
                        'content' => <<<'JS'
function paginate(items, page = 1, limit = 10) {
  const safePage = Math.max(1, parseInt(page, 10) || 1);
  const safeLimit = Math.max(1, parseInt(limit, 10) || 10);
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / safeLimit));

  const startIndex = (safePage - 1) * safeLimit;
  const endIndex = startIndex + safeLimit;

  const pageItems = items.slice(startIndex, endIndex);

  return {
    page: safePage,
    limit: safeLimit,
    total_items: totalItems,
    total_pages: totalPages,
    has_next_page: safePage < totalPages,
    has_prev_page: safePage > 1,
    data: pageItems
  };
}

module.exports = { paginate };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['api_design', 'pagination', 'slice_bounds'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'JavaScript Array.prototype.slice parameter semantics',
                        'content' => 'In JavaScript, is the second argument of slice(start, end) inclusive or non-inclusive?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Compare startIndex + limit with startIndex + limit - 1',
                        'content' => 'Because slice() excludes the end index, subtracting 1 means your page will always return limit - 1 items!'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Fix the endIndex formula',
                        'content' => 'Change `const endIndex = startIndex + safeLimit - 1;` to `const endIndex = startIndex + safeLimit;`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full resolution walkthrough',
                        'content' => '`Array.prototype.slice(start, end)` copies up to, but not including, `end`. Therefore `slice(0, 5)` includes indices 0, 1, 2, 3, 4 (5 elements). With `- 1`, it stopped at index 3 (4 elements). Removing `- 1` fixes all pagination slices.'
                    ]
                ],
                'order_index' => 2,
            ],

            // -----------------------------------------------------------------
            // Quest 3: JWT Session Expiry Timestamp Bypass
            // -----------------------------------------------------------------
            [
                'slug' => 'jwt-session-expiry-bypass',
                'title' => 'Security: Authentication Accepts Expired JWT Sessions',
                'difficulty' => 'intermediate',
                'category' => 'auth_security',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 30,
                'description' => "A critical security audit revealed that expired access tokens are accepted by our authentication middleware for up to several hours after expiration.",
                'bug_report' => [
                    'issue_title' => 'Middleware compares Unix seconds exp with Date.now() milliseconds',
                    'symptoms' => 'An authentication token created with exp = 1700000000 (seconds) is compared against Date.now() (milliseconds), causing unit mismatch comparisons.',
                    'expected_behavior' => 'If `payload.exp <= currentTimeInSeconds`, the session must be rejected with `{ valid: false, reason: "Token expired" }`.',
                    'actual_behavior' => 'Middleware evaluates `payload.exp < Date.now()` (e.g. 1,700,000,000 < 1,700,000,000,000), which is always true or desynchronized.',
                    'reproduction_steps' => [
                        '1. Generate token with exp set to 10 seconds in the past.',
                        '2. Call verifyToken(token).',
                        '3. Middleware returns valid: true.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/auth.js`.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/auth.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class AuthValidator {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  verifyToken(payload, signature) {
    if (!payload || !payload.exp) {
      return { valid: false, reason: 'Malformed payload' };
    }

    // BUG: payload.exp is standard Unix timestamp in SECONDS
    // Date.now() returns timestamp in MILLISECONDS!
    // Comparing seconds directly with milliseconds results in severe unit mismatch!
    const currentMs = Date.now();
    const isExpired = payload.exp * 1000 < currentMs; // Note the inversion logic below

    // BUGGY CHECK: Developer wrote `if (payload.exp > Date.now())` inverted
    if (payload.exp > Date.now()) {
      return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, user_id: payload.sub };
  }
}

module.exports = { AuthValidator };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { AuthValidator } = require('../src/auth');

const tests = [];

function runTest(name, isHidden, fn) {
  const start = Date.now();
  try {
    fn();
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'passed',
      passed: true,
      duration_ms: Date.now() - start
    });
  } catch (err) {
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'failed',
      passed: false,
      error: err.message,
      stack: err.stack,
      duration_ms: Date.now() - start
    });
  }
}

const auth = new AuthValidator('test-secret');

// Visible Test 1: Valid future token
runTest('Accepts valid future token', false, () => {
  const futureSeconds = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
  const result = auth.verifyToken({ sub: 'user_123', exp: futureSeconds }, 'sig');
  if (!result.valid) throw new Error(`Expected valid true, got ${result.valid} (${result.reason})`);
});

// Visible Test 2: Expired token in past (THE BUG)
runTest('Rejects token expired 60 seconds ago', false, () => {
  const pastSeconds = Math.floor(Date.now() / 1000) - 60; // 60 seconds ago
  const result = auth.verifyToken({ sub: 'user_123', exp: pastSeconds }, 'sig');
  if (result.valid) {
    throw new Error('SECURITY VULNERABILITY: Expired token was accepted as valid!');
  }
  if (result.reason !== 'Token expired') {
    throw new Error(`Expected reason 'Token expired', got '${result.reason}'`);
  }
});

// Hidden Test 3: Immediate boundary check
runTest('Rejects token expiring right at current second', true, () => {
  const currentSeconds = Math.floor(Date.now() / 1000);
  const result = auth.verifyToken({ sub: 'user_456', exp: currentSeconds }, 'sig');
  if (result.valid) throw new Error('Token at current second should be expired');
});

console.log('BUGQUEST_REPORT_START');
console.log(JSON.stringify({ tests }));
console.log('BUGQUEST_REPORT_END');
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/auth.js',
                        'content' => <<<'JS'
class AuthValidator {
  constructor(secretKey) {
    this.secretKey = secretKey;
  }

  verifyToken(payload, signature) {
    if (!payload || !payload.exp) {
      return { valid: false, reason: 'Malformed payload' };
    }

    const currentSeconds = Math.floor(Date.now() / 1000);

    if (payload.exp <= currentSeconds) {
      return { valid: false, reason: 'Token expired' };
    }

    return { valid: true, user_id: payload.sub };
  }
}

module.exports = { AuthValidator };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['security', 'authentication', 'timestamps'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Units of measurement in time comparison',
                        'content' => 'What unit does `Date.now()` return? What unit do JWT `exp` claims use?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Milliseconds vs Seconds',
                        'content' => 'JWT `exp` is in seconds since epoch. `Date.now()` is in milliseconds. Convert `Date.now()` to seconds using `Math.floor(Date.now() / 1000)`.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Check comparison operator',
                        'content' => 'If `payload.exp <= currentSeconds`, the token is expired. The current code compares `payload.exp > Date.now()` directly.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Canonical fix walkthrough',
                        'content' => 'Convert `currentSeconds = Math.floor(Date.now() / 1000)`. Then check `if (payload.exp <= currentSeconds) return { valid: false, reason: "Token expired" };`.'
                    ]
                ],
                'order_index' => 3,
            ],

            // -----------------------------------------------------------------
            // Quest 4: CSV / Log Parser Empty Column Crash
            // -----------------------------------------------------------------
            [
                'slug' => 'csv-empty-field-crash',
                'title' => 'Data Pipeline: CSV Parser Crashes on Null Optional Columns',
                'difficulty' => 'beginner',
                'category' => 'data_parsing',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 20,
                'description' => "Our telemetry ingestion pipeline crashed in production when processing user CSV imports where optional phone numbers or middle names were left empty.",
                'bug_report' => [
                    'issue_title' => 'Calling .trim() or .toLowerCase() directly on optional CSV column without null check',
                    'symptoms' => '`TypeError: Cannot read properties of undefined (reading "trim")` when an optional column is empty in a row.',
                    'expected_behavior' => 'Rows with empty optional columns should parse successfully, setting the field to null or empty string.',
                    'actual_behavior' => '`sanitizeRow()` assumes all columns exist and calls `.trim()` unconditionally on `row[colIndex]`.',
                    'reproduction_steps' => [
                        '1. Parse CSV string "Alice,alice@example.com," with trailing empty column.',
                        '2. Observe unhandled exception thrown.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/parser.js`.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/parser.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
function parseCSV(content) {
  if (!content || typeof content !== 'string') return [];
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = rawLine.split(',');
    const record = {};

    headers.forEach((header, index) => {
      // BUG: If values[index] is undefined or null, calling .trim() throws TypeError!
      const rawVal = values[index];
      record[header] = rawVal.trim();
    });

    records.push(record);
  }

  return records;
}

module.exports = { parseCSV };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { parseCSV } = require('../src/parser');

const tests = [];

function runTest(name, isHidden, fn) {
  const start = Date.now();
  try {
    fn();
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'passed',
      passed: true,
      duration_ms: Date.now() - start
    });
  } catch (err) {
    tests.push({
      name,
      is_hidden: isHidden,
      status: 'failed',
      passed: false,
      error: err.message,
      stack: err.stack,
      duration_ms: Date.now() - start
    });
  }
}

// Visible Test 1: Full row
runTest('Parses complete row with all columns', false, () => {
  const csv = "name,email,phone\nJohn,john@example.com,555-1234";
  const rows = parseCSV(csv);
  if (rows.length !== 1) throw new Error(`Expected 1 row, got ${rows.length}`);
  if (rows[0].name !== 'John' || rows[0].phone !== '555-1234') {
    throw new Error('Data parsed incorrectly');
  }
});

// Visible Test 2: Empty optional column (THE BUG)
runTest('Parses row with missing optional column without crashing', false, () => {
  const csv = "name,email,phone\nJane,jane@example.com";
  const rows = parseCSV(csv);
  if (rows.length !== 1) throw new Error(`Expected 1 row, got ${rows.length}`);
  if (rows[0].phone !== '' && rows[0].phone !== null) {
    throw new Error(`Expected phone to be empty or null, got ${rows[0].phone}`);
  }
});

// Hidden Test 3: Trailing comma empty value
runTest('Parses row with trailing comma', true, () => {
  const csv = "name,email,phone\nBob,bob@example.com,";
  const rows = parseCSV(csv);
  if (rows.length !== 1) throw new Error('Expected 1 row');
  if (rows[0].phone !== '') throw new Error('Expected empty string for trailing comma');
});

console.log('BUGQUEST_REPORT_START');
console.log(JSON.stringify({ tests }));
console.log('BUGQUEST_REPORT_END');
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/parser.js',
                        'content' => <<<'JS'
function parseCSV(content) {
  if (!content || typeof content !== 'string') return [];
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim());
  const records = [];

  for (let i = 1; i < lines.length; i++) {
    const rawLine = lines[i].trim();
    if (!rawLine) continue;

    const values = rawLine.split(',');
    const record = {};

    headers.forEach((header, index) => {
      const rawVal = values[index];
      record[header] = (rawVal !== undefined && rawVal !== null) ? rawVal.trim() : '';
    });

    records.push(record);
  }

  return records;
}

module.exports = { parseCSV };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['data_parsing', 'error_handling', 'null_safety'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Null/undefined safety check',
                        'content' => 'What is values[index] when a CSV row has fewer comma-separated values than headers?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Guard the .trim() call',
                        'content' => 'Before calling `.trim()`, check if `rawVal` is defined. If undefined or null, fallback to `""`.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Ternary fallback',
                        'content' => 'Use `record[header] = rawVal ? rawVal.trim() : "";`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'Check `rawVal !== undefined && rawVal !== null ? rawVal.trim() : ""`. This prevents `TypeError: Cannot read properties of undefined`.'
                    ]
                ],
                'order_index' => 4,
            ],

            // -----------------------------------------------------------------
            // Quest 5: Stripe Webhook Duplicate Delivery Race Condition
            // -----------------------------------------------------------------
            [
                'slug' => 'webhook-duplicate-event-race',
                'title' => 'Stripe Webhook Duplicate Delivery Race Condition',
                'difficulty' => 'intermediate',
                'category' => 'concurrency',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 30,
                'description' => "Customers report duplicate credits appearing in their account balance when payment webhook events are delivered in rapid bursts. Investigate the event processing pipeline and prevent check-then-act race conditions.",
                'bug_report' => [
                    'issue_title' => 'Concurrent duplicate webhooks cause duplicate ledger credits',
                    'symptoms' => 'When two identical webhook notifications for payment `evt_burst` arrive simultaneously (e.g. gateway network retry), the account balance receives twice the expected credit amount.',
                    'expected_behavior' => 'Webhook processing must be strictly idempotent. Even when identical events arrive in the same millisecond, only the first must credit the account; the duplicate must be safely skipped.',
                    'actual_behavior' => 'In `src/webhook_handler.js`, `handlePaymentWebhook()` checks `this.eventStore.isProcessed(event.id)`. Because asynchronous credit processing happens before `markProcessed()`, both concurrent requests pass the check before either marks the event processed.',
                    'reproduction_steps' => [
                        '1. Instantiate WebhookHandler with EventStore and FakeLedger.',
                        '2. Fire two identical events simultaneously with Promise.all([handler.handle(ev), handler.handle(ev)]).',
                        '3. Inspect ledger balance. Balance is $200 instead of $100.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/webhook_handler.js`. Do not modify `src/event_store.js` or `tests/runner.cjs`.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/event_store.js',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class EventStore {
  constructor() {
    this.processed = new Set();
    this.inFlight = new Set();
  }

  isProcessed(id) {
    return this.processed.has(id);
  }

  markProcessed(id) {
    this.inFlight.delete(id);
    this.processed.add(id);
  }

  // Atomically reserves an event ID if neither processed nor already in flight.
  // Returns true if reservation was granted, false otherwise.
  reserve(id) {
    if (this.processed.has(id) || this.inFlight.has(id)) {
      return false;
    }
    this.inFlight.add(id);
    return true;
  }
}

module.exports = { EventStore };
JS
                    ],
                    [
                        'path' => 'src/webhook_handler.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class WebhookHandler {
  constructor(eventStore, ledger) {
    this.eventStore = eventStore;
    this.ledger = ledger;
  }

  /**
   * Process incoming payment webhook event
   * @param {Object} event - { id: string, accountId: string, amount: number }
   */
  async handlePaymentWebhook(event) {
    // BUG: Check-then-act race condition!
    // isProcessed returns false for both concurrent calls before markProcessed executes.
    if (this.eventStore.isProcessed(event.id)) {
      return { status: 'skipped', reason: 'already_processed' };
    }

    // Simulate async IO delay
    await new Promise(resolve => setTimeout(resolve, 15));

    // Credit ledger
    this.ledger.addCredit(event.accountId, event.amount);

    this.eventStore.markProcessed(event.id);
    return { status: 'success', accountId: event.accountId, credited: event.amount };
  }
}

module.exports = { WebhookHandler };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { EventStore } = require('../src/event_store');
const { WebhookHandler } = require('../src/webhook_handler');

class FakeLedger {
  constructor() {
    this.balances = {};
  }
  addCredit(acc, amount) {
    this.balances[acc] = (this.balances[acc] || 0) + amount;
  }
}

async function runTests() {
  const results = [];

  // Test 1: Sequential events
  try {
    const store = new EventStore();
    const ledger = new FakeLedger();
    const handler = new WebhookHandler(store, ledger);

    const res1 = await handler.handlePaymentWebhook({ id: 'evt_1', accountId: 'acc_1', amount: 50 });
    const res2 = await handler.handlePaymentWebhook({ id: 'evt_1', accountId: 'acc_1', amount: 50 });

    if (res1.status === 'success' && res2.status === 'skipped' && ledger.balances['acc_1'] === 50) {
      results.push({ name: 'Sequential duplicate webhook skipped', passed: true, error: null, is_hidden: false });
    } else {
      results.push({ name: 'Sequential duplicate webhook skipped', passed: false, error: `Expected 50 balance, got ${ledger.balances['acc_1']}`, is_hidden: false });
    }
  } catch (err) {
    results.push({ name: 'Sequential duplicate webhook skipped', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: Concurrent duplicate burst (reproduction)
  try {
    const store = new EventStore();
    const ledger = new FakeLedger();
    const handler = new WebhookHandler(store, ledger);

    const event = { id: 'evt_burst', accountId: 'acc_burst', amount: 100 };
    const [r1, r2] = await Promise.all([
      handler.handlePaymentWebhook(event),
      handler.handlePaymentWebhook(event)
    ]);

    const successes = [r1, r2].filter(r => r.status === 'success');
    const skipped = [r1, r2].filter(r => r.status === 'skipped');

    if (successes.length === 1 && skipped.length === 1 && ledger.balances['acc_burst'] === 100) {
      results.push({ name: 'Concurrent duplicate burst only credits once', passed: true, error: null, is_hidden: false });
    } else {
      results.push({ name: 'Concurrent duplicate burst only credits once', passed: false, error: `Expected 1 credit ($100), got ${successes.length} credits with balance $${ledger.balances['acc_burst'] || 0}`, is_hidden: false });
    }
  } catch (err) {
    results.push({ name: 'Concurrent duplicate burst only credits once', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Multiple unique accounts concurrent (hidden)
  try {
    const store = new EventStore();
    const ledger = new FakeLedger();
    const handler = new WebhookHandler(store, ledger);

    await Promise.all([
      handler.handlePaymentWebhook({ id: 'evt_a', accountId: 'user_1', amount: 25 }),
      handler.handlePaymentWebhook({ id: 'evt_b', accountId: 'user_2', amount: 35 }),
      handler.handlePaymentWebhook({ id: 'evt_a', accountId: 'user_1', amount: 25 }),
      handler.handlePaymentWebhook({ id: 'evt_b', accountId: 'user_2', amount: 35 }),
    ]);

    const ok = ledger.balances['user_1'] === 25 && ledger.balances['user_2'] === 35;
    results.push({ name: 'Hidden: Multi-account concurrency lock', passed: ok, error: ok ? null : 'Balances incorrect', is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Multi-account concurrency lock', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/webhook_handler.js',
                        'content' => <<<'JS'
class WebhookHandler {
  constructor(eventStore, ledger) {
    this.eventStore = eventStore;
    this.ledger = ledger;
  }

  /**
   * Process incoming payment webhook event
   * @param {Object} event - { id: string, accountId: string, amount: number }
   */
  async handlePaymentWebhook(event) {
    // Acquire atomic reservation before entering async work
    if (!this.eventStore.reserve(event.id)) {
      return { status: 'skipped', reason: 'already_processed' };
    }

    try {
      // Simulate async IO delay
      await new Promise(resolve => setTimeout(resolve, 15));

      // Credit ledger
      this.ledger.addCredit(event.accountId, event.amount);

      this.eventStore.markProcessed(event.id);
      return { status: 'success', accountId: event.accountId, credited: event.amount };
    } catch (err) {
      throw err;
    }
  }
}

module.exports = { WebhookHandler };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['Concurrency', 'Race Condition', 'Idempotency', 'Webhooks'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Observe check-then-act pattern',
                        'content' => 'What happens when two identical requests hit `isProcessed()` at the exact same moment?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Check EventStore methods',
                        'content' => 'Inspect `src/event_store.js`. Does it offer an atomic reservation method that combines check and lock?'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Use reserve()',
                        'content' => 'Call `if (!this.eventStore.reserve(event.id))` instead of `isProcessed(event.id)`. This atomically locks in-flight events.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'Replace `if (this.eventStore.isProcessed(event.id))` with `if (!this.eventStore.reserve(event.id)) return { status: "skipped", reason: "already_processed" };`. The `reserve()` call immediately sets the ID as in-flight before the async delay.'
                    ]
                ],
                'order_index' => 5,
            ],

            // -----------------------------------------------------------------
            // Quest 6: Microservice Event Sorter Inverts Simultaneous Timestamps
            // -----------------------------------------------------------------
            [
                'slug' => 'timeline-event-timestamp-tiebreak',
                'title' => 'Microservice Event Sorter Inverts Simultaneous Timestamps',
                'difficulty' => 'intermediate',
                'category' => 'boundary_edge',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 20,
                'description' => "Audit compliance officers noticed that when high-frequency microservice transactions occur within the same millisecond timestamp, event ordering becomes non-deterministic and can reverse cause-and-effect in audit trails.",
                'bug_report' => [
                    'issue_title' => 'Event timeline sort lacks tiebreak logic for equal timestamps',
                    'symptoms' => 'Two audit events with timestamp `1700000000000` (e.g. Account Created seq:1, Account Suspended seq:2) can be sorted in reverse order depending on JS engine sort stability.',
                    'expected_behavior' => 'Timeline sorting must be strictly deterministic. When event timestamps are identical, the sort must tiebreak by `sequenceId` in ascending order.',
                    'actual_behavior' => 'In `src/timeline.js`, `sortTimeline()` compares `a.timestamp - b.timestamp`. When timestamps match, it returns 0 without evaluating `sequenceId`.',
                    'reproduction_steps' => [
                        '1. Pass an array of 3 events with timestamp 1000 and sequence IDs 3, 1, 2 to `sortTimeline()`.',
                        '2. Starter code fails to order them as [1, 2, 3].'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/timeline.js`. Do not modify test runner files.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/timeline.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
/**
 * Sorts audit timeline events chronologically.
 * Each event: { id: string, timestamp: number, sequenceId: number, type: string }
 */
function sortTimeline(events) {
  if (!Array.isArray(events)) return [];

  // BUG: Only sorts by timestamp. When timestamp is identical,
  // tiebreak is undefined/unstable and fails to preserve causal sequenceId!
  return [...events].sort((a, b) => a.timestamp - b.timestamp);
}

module.exports = { sortTimeline };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { sortTimeline } = require('../src/timeline');

function runTests() {
  const results = [];

  // Test 1: Distinct timestamps
  try {
    const events = [
      { id: 'e3', timestamp: 300, sequenceId: 1 },
      { id: 'e1', timestamp: 100, sequenceId: 2 },
      { id: 'e2', timestamp: 200, sequenceId: 3 }
    ];
    const sorted = sortTimeline(events);
    const ok = sorted[0].id === 'e1' && sorted[1].id === 'e2' && sorted[2].id === 'e3';
    results.push({ name: 'Sort distinct timestamps', passed: ok, error: ok ? null : 'Order incorrect', is_hidden: false });
  } catch (err) {
    results.push({ name: 'Sort distinct timestamps', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: Simultaneous timestamps with tiebreak (reproduction)
  try {
    const events = [
      { id: 'sub_3', timestamp: 1000, sequenceId: 3 },
      { id: 'sub_1', timestamp: 1000, sequenceId: 1 },
      { id: 'sub_2', timestamp: 1000, sequenceId: 2 }
    ];
    const sorted = sortTimeline(events);
    const ok = sorted[0].id === 'sub_1' && sorted[1].id === 'sub_2' && sorted[2].id === 'sub_3';
    results.push({
      name: 'Simultaneous events sorted by sequenceId tiebreaker',
      passed: ok,
      error: ok ? null : `Got order: ${sorted.map(e => e.id).join(', ')}`,
      is_hidden: false
    });
  } catch (err) {
    results.push({ name: 'Simultaneous events sorted by sequenceId tiebreaker', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Mixed timestamps and sequence IDs (hidden)
  try {
    const events = [
      { id: 'b2', timestamp: 2000, sequenceId: 2 },
      { id: 'a1', timestamp: 1000, sequenceId: 1 },
      { id: 'b1', timestamp: 2000, sequenceId: 1 },
      { id: 'a2', timestamp: 1000, sequenceId: 2 }
    ];
    const sorted = sortTimeline(events);
    const expected = ['a1', 'a2', 'b1', 'b2'];
    const actual = sorted.map(e => e.id);
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    results.push({ name: 'Hidden: Multi-epoch mixed tiebreak', passed: ok, error: ok ? null : `Got: ${actual.join(',')}`, is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Multi-epoch mixed tiebreak', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/timeline.js',
                        'content' => <<<'JS'
/**
 * Sorts audit timeline events chronologically.
 * Each event: { id: string, timestamp: number, sequenceId: number, type: string }
 */
function sortTimeline(events) {
  if (!Array.isArray(events)) return [];

  return [...events].sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return a.timestamp - b.timestamp;
    }
    return (a.sequenceId || 0) - (b.sequenceId || 0);
  });
}

module.exports = { sortTimeline };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['Sorting', 'Audit Trail', 'Boundary Conditions', 'Determinism'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Look at equal timestamps',
                        'content' => 'What does `a.timestamp - b.timestamp` return when both timestamps are 1000?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Secondary sorting key',
                        'content' => 'When `a.timestamp === b.timestamp`, check `a.sequenceId` vs `b.sequenceId`.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Use if condition in comparator',
                        'content' => 'If `a.timestamp !== b.timestamp`, return `a.timestamp - b.timestamp`. Otherwise, return `a.sequenceId - b.sequenceId`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'In `src/timeline.js`, replace the one-line sort with a comparator function that falls back to sequenceId whenever timestamps are equal.'
                    ]
                ],
                'order_index' => 6,
            ],

            // -----------------------------------------------------------------
            // Quest 7: Token Bucket Rate Limiter Deducts Tokens on Rejected Requests
            // -----------------------------------------------------------------
            [
                'slug' => 'rate-limiter-token-bucket-leak',
                'title' => 'Token Bucket Rate Limiter Deducts Tokens on Rejected Requests',
                'difficulty' => 'intermediate',
                'category' => 'logic_state',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 25,
                'description' => "During traffic spikes, the API rate limiting middleware locks out legitimate users for extended periods. Diagnostics reveal that rejected requests deduct tokens prior to validating available capacity, creating severe token deficits.",
                'bug_report' => [
                    'issue_title' => 'Token bucket capacity drops below zero on rejected requests',
                    'symptoms' => 'When a burst of 10 requests hits a bucket with capacity 5, the remaining 5 rejected requests drive the internal token counter into negative numbers (-5), requiring 10 seconds of refilling instead of 5.',
                    'expected_behavior' => 'Rejected requests must not consume tokens. If a request cannot be fulfilled, the bucket capacity should remain unchanged.',
                    'actual_behavior' => 'In `src/token_bucket.js`, `consume()` subtracts `count` from `this.tokens` before evaluating whether `this.tokens < 0`.',
                    'reproduction_steps' => [
                        '1. Create TokenBucket(5, 1).',
                        '2. Attempt to consume 10 tokens.',
                        '3. Call returns false, but `bucket.tokens` is -5 instead of 5.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/token_bucket.js`. Do not modify test runner files.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/token_bucket.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRatePerSec;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + (elapsedSec * this.refillRate));
    this.lastRefill = now;
  }

  /**
   * Attempts to consume specified number of tokens.
   * Returns true if allowed, false if rate limited.
   */
  consume(count = 1) {
    this.refill();

    // BUG: Deducts tokens BEFORE checking if capacity allows it!
    this.tokens -= count;
    if (this.tokens < 0) {
      return false; // rejected, but tokens is now negative!
    }
    return true;
  }

  getAvailableTokens() {
    this.refill();
    return this.tokens;
  }
}

module.exports = { TokenBucket };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { TokenBucket } = require('../src/token_bucket');

function runTests() {
  const results = [];

  // Test 1: Normal consumption
  try {
    const bucket = new TokenBucket(10, 2);
    const ok1 = bucket.consume(3);
    const ok2 = bucket.consume(3);
    const ok = ok1 && ok2 && bucket.getAvailableTokens() <= 4.1;
    results.push({ name: 'Normal token consumption within capacity', passed: ok, error: ok ? null : 'Failed consumption', is_hidden: false });
  } catch (err) {
    results.push({ name: 'Normal token consumption within capacity', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: Rejected request should NOT deduct tokens (reproduction)
  try {
    const bucket = new TokenBucket(5, 1);
    const allowed = bucket.consume(10); // Should be false
    const remaining = bucket.getAvailableTokens();

    const ok = allowed === false && remaining >= 4.9;
    results.push({
      name: 'Rejected request does not deduct tokens',
      passed: ok,
      error: ok ? null : `Expected ~5 remaining tokens, got ${remaining.toFixed(2)}`,
      is_hidden: false
    });
  } catch (err) {
    results.push({ name: 'Rejected request does not deduct tokens', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Burst boundary test (hidden)
  try {
    const bucket = new TokenBucket(3, 1);
    bucket.consume(2); // 1 left
    const reject = bucket.consume(5); // rejected, still 1 left
    const accept = bucket.consume(1); // accepted!
    const ok = reject === false && accept === true;
    results.push({ name: 'Hidden: Subsequent valid request succeeds after rejection', passed: ok, error: ok ? null : 'Token leak prevented subsequent valid request', is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Subsequent valid request succeeds after rejection', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/token_bucket.js',
                        'content' => <<<'JS'
class TokenBucket {
  constructor(capacity, refillRatePerSec) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillRate = refillRatePerSec;
    this.lastRefill = Date.now();
  }

  refill() {
    const now = Date.now();
    const elapsedSec = (now - this.lastRefill) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + (elapsedSec * this.refillRate));
    this.lastRefill = now;
  }

  /**
   * Attempts to consume specified number of tokens.
   * Returns true if allowed, false if rate limited.
   */
  consume(count = 1) {
    this.refill();

    if (this.tokens < count) {
      return false;
    }

    this.tokens -= count;
    return true;
  }

  getAvailableTokens() {
    this.refill();
    return this.tokens;
  }
}

module.exports = { TokenBucket };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['Rate Limiting', 'State Management', 'Resource Leaks', 'Token Bucket'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Order of operations in consume()',
                        'content' => 'Look at the line where `this.tokens -= count` occurs. When should subtraction take place?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Guard condition before mutation',
                        'content' => 'Check whether `this.tokens < count` before modifying `this.tokens`.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Early return on insufficient capacity',
                        'content' => 'If `this.tokens < count`, return `false` immediately without deducting.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'In `src/token_bucket.js`, rewrite `consume(count)` to verify `if (this.tokens < count) return false;` before executing `this.tokens -= count; return true;`.'
                    ]
                ],
                'order_index' => 7,
            ],

            // -----------------------------------------------------------------
            // Quest 8: Profile Service Email Update Leaves Stale Cache Index
            // -----------------------------------------------------------------
            [
                'slug' => 'cache-invalidation-stale-email',
                'title' => 'Profile Service Email Update Leaves Stale Cache Index',
                'difficulty' => 'intermediate',
                'category' => 'performance_caching',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 25,
                'description' => "When users change their registered email address, logging in with their old email address still succeeds and accesses their account, while attempts to log in with their newly verified email fail.",
                'bug_report' => [
                    'issue_title' => 'Secondary lookup cache not invalidated during email update',
                    'symptoms' => 'User updates email from `old@company.com` to `new@company.com`. `getUserByEmail("old@company.com")` returns the user record from cache instead of null.',
                    'expected_behavior' => 'When a user updates their email, both the primary ID cache key AND any associated secondary index cache keys (old email and new email) must be invalidated or updated.',
                    'actual_behavior' => 'In `src/user_service.js`, `updateEmail()` only invalidates `user:${userId}`. The `email:${oldEmail}` entry persists in cache indefinitely.',
                    'reproduction_steps' => [
                        '1. Query user by old email to warm cache.',
                        '2. Call `updateEmail(userId, newEmail)`.',
                        '3. Query user by old email. Cache returns stale user object.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/user_service.js`. Do not modify `src/cache.js` or `tests/runner.cjs`.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/cache.js',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    return this.store.get(key) || null;
  }

  set(key, val) {
    this.store.set(key, val);
  }

  del(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = { MemoryCache };
JS
                    ],
                    [
                        'path' => 'src/user_service.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class UserService {
  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }

  async getUserById(id) {
    const cached = this.cache.get(`user:${id}`);
    if (cached) return cached;
    const user = await this.db.findById(id);
    if (user) this.cache.set(`user:${id}`, user);
    return user;
  }

  async getUserByEmail(email) {
    const cached = this.cache.get(`email:${email}`);
    if (cached) return cached;
    const user = await this.db.findByEmail(email);
    if (user) this.cache.set(`email:${email}`, user);
    return user;
  }

  /**
   * Updates user email address
   */
  async updateEmail(userId, newEmail) {
    const user = await this.db.findById(userId);
    if (!user) throw new Error('User not found');

    await this.db.update(userId, { email: newEmail });

    // BUG: Only invalidates user:${userId}, forgetting email:${oldEmail}!
    this.cache.del(`user:${userId}`);
    return { success: true };
  }
}

module.exports = { UserService };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { MemoryCache } = require('../src/cache');
const { UserService } = require('../src/user_service');

class FakeDb {
  constructor(initialUsers = []) {
    this.users = new Map(initialUsers.map(u => [u.id, { ...u }]));
  }
  async findById(id) {
    return this.users.get(id) || null;
  }
  async findByEmail(email) {
    for (const u of this.users.values()) {
      if (u.email === email) return { ...u };
    }
    return null;
  }
  async update(id, fields) {
    const user = this.users.get(id);
    if (!user) return null;
    Object.assign(user, fields);
    return { ...user };
  }
}

async function runTests() {
  const results = [];

  // Test 1: User ID cache invalidation
  try {
    const db = new FakeDb([{ id: 'u1', name: 'Alice', email: 'alice@old.com' }]);
    const cache = new MemoryCache();
    const service = new UserService(db, cache);

    await service.getUserById('u1'); // warm cache
    await service.updateEmail('u1', 'alice@new.com');
    const updated = await service.getUserById('u1');

    const ok = updated.email === 'alice@new.com';
    results.push({ name: 'User ID cache reflects updated email', passed: ok, error: ok ? null : 'Stale user ID cache', is_hidden: false });
  } catch (err) {
    results.push({ name: 'User ID cache reflects updated email', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: Old email secondary index must NOT return stale user (reproduction)
  try {
    const db = new FakeDb([{ id: 'u2', name: 'Bob', email: 'bob@old.com' }]);
    const cache = new MemoryCache();
    const service = new UserService(db, cache);

    await service.getUserByEmail('bob@old.com'); // warm cache
    await service.updateEmail('u2', 'bob@new.com');

    const lookupOld = await service.getUserByEmail('bob@old.com');
    const lookupNew = await service.getUserByEmail('bob@new.com');

    const ok = lookupOld === null && lookupNew !== null && lookupNew.id === 'u2';
    results.push({
      name: 'Old email cache entry invalidated and new email accessible',
      passed: ok,
      error: ok ? null : `Old email still returned user: ${lookupOld ? lookupOld.id : 'null'}`,
      is_hidden: false
    });
  } catch (err) {
    results.push({ name: 'Old email cache entry invalidated and new email accessible', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Multiple consecutive updates (hidden)
  try {
    const db = new FakeDb([{ id: 'u3', name: 'Charlie', email: 'c1@test.com' }]);
    const cache = new MemoryCache();
    const service = new UserService(db, cache);

    await service.getUserByEmail('c1@test.com');
    await service.updateEmail('u3', 'c2@test.com');
    await service.getUserByEmail('c2@test.com');
    await service.updateEmail('u3', 'c3@test.com');

    const c1 = await service.getUserByEmail('c1@test.com');
    const c2 = await service.getUserByEmail('c2@test.com');
    const c3 = await service.getUserByEmail('c3@test.com');

    const ok = c1 === null && c2 === null && c3 && c3.id === 'u3';
    results.push({ name: 'Hidden: Multiple consecutive email updates clean all intermediate keys', passed: ok, error: ok ? null : 'Intermediate email key remained cached', is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Multiple consecutive email updates clean all intermediate keys', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/user_service.js',
                        'content' => <<<'JS'
class UserService {
  constructor(db, cache) {
    this.db = db;
    this.cache = cache;
  }

  async getUserById(id) {
    const cached = this.cache.get(`user:${id}`);
    if (cached) return cached;
    const user = await this.db.findById(id);
    if (user) this.cache.set(`user:${id}`, user);
    return user;
  }

  async getUserByEmail(email) {
    const cached = this.cache.get(`email:${email}`);
    if (cached) return cached;
    const user = await this.db.findByEmail(email);
    if (user) this.cache.set(`email:${email}`, user);
    return user;
  }

  /**
   * Updates user email address
   */
  async updateEmail(userId, newEmail) {
    const user = await this.db.findById(userId);
    if (!user) throw new Error('User not found');

    const oldEmail = user.email;
    await this.db.update(userId, { email: newEmail });

    // Invalidate user ID key and both old and new email lookup keys
    this.cache.del(`user:${userId}`);
    if (oldEmail) {
      this.cache.del(`email:${oldEmail}`);
    }
    this.cache.del(`email:${newEmail}`);

    return { success: true };
  }
}

module.exports = { UserService };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['Caching', 'Redis', 'Secondary Index', 'Cache Invalidation'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'How many keys are in the cache?',
                        'content' => 'Look at `getUserByEmail`. What key format does it use to store user records?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Remember the previous email',
                        'content' => 'Store `user.email` in a local variable before updating the database.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Invalidate old email key',
                        'content' => 'Call `this.cache.del("email:" + oldEmail)` in addition to `this.cache.del("user:" + userId)`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'Before calling `this.db.update()`, save `const oldEmail = user.email;`. After update, delete `user:${userId}`, `email:${oldEmail}`, and `email:${newEmail}`.'
                    ]
                ],
                'order_index' => 8,
            ],

            // -----------------------------------------------------------------
            // Quest 9: Retry Policy Exponential Backoff Integer Overflow
            // -----------------------------------------------------------------
            [
                'slug' => 'exponential-backoff-overflow',
                'title' => 'Retry Policy Bitwise Shift Wraps into Negative Delay',
                'difficulty' => 'advanced',
                'category' => 'logic_state',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 30,
                'description' => "During a third-party payment gateway outage, the retry worker suddenly launched millions of requests per second instead of backing off. Investigation traced the issue to 32-bit signed bitwise shift overflow producing negative delay times.",
                'bug_report' => [
                    'issue_title' => 'Bitwise shift (1 << attempt) overflows to negative integer at attempt 31',
                    'symptoms' => 'At retry attempt 31 and above, `computeDelay()` returns negative numbers (e.g. -2147483648000 ms), causing `setTimeout` to fire instantly with 0 delay and flooding downstream servers.',
                    'expected_behavior' => 'Delays must be strictly non-negative and capped at `maxDelayMs`. High attempt counts must gracefully saturate at `maxDelayMs`.',
                    'actual_behavior' => 'In `src/retry_policy.js`, `computeDelay()` calculates `(1 << attempt) * this.baseDelayMs`. In JavaScript, `<<` converts operands to 32-bit signed integers, wrapping `1 << 31` to `-2147483648`.',
                    'reproduction_steps' => [
                        '1. Call `policy.computeDelay(31)`.',
                        '2. Starter code returns negative value instead of maxDelayMs.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/retry_policy.js`. Do not modify test runner files.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/retry_policy.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class RetryPolicy {
  constructor(baseDelayMs = 1000, maxDelayMs = 30000) {
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  /**
   * Computes backoff delay for given attempt count (0-indexed).
   * @param {number} attempt
   * @returns {number} Delay in milliseconds
   */
  computeDelay(attempt) {
    if (attempt < 0) return this.baseDelayMs;

    // BUG: (1 << attempt) is a 32-bit signed bitwise operation in JavaScript.
    // For attempt >= 31, (1 << 31) becomes -2147483648!
    // Math.min(-2147483648000, 30000) returns -2147483648000!
    const factor = (1 << attempt);
    const delay = factor * this.baseDelayMs;
    return Math.min(delay, this.maxDelayMs);
  }
}

module.exports = { RetryPolicy };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { RetryPolicy } = require('../src/retry_policy');

function runTests() {
  const results = [];

  // Test 1: Low attempt counts
  try {
    const policy = new RetryPolicy(1000, 30000);
    const d0 = policy.computeDelay(0); // 1000
    const d1 = policy.computeDelay(1); // 2000
    const d2 = policy.computeDelay(2); // 4000

    const ok = d0 === 1000 && d1 === 2000 && d2 === 4000;
    results.push({ name: 'Standard exponential backoff for low attempts', passed: ok, error: ok ? null : 'Incorrect low attempt delay', is_hidden: false });
  } catch (err) {
    results.push({ name: 'Standard exponential backoff for low attempts', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: High attempt overflow test (reproduction)
  try {
    const policy = new RetryPolicy(1000, 30000);
    const d31 = policy.computeDelay(31);
    const d35 = policy.computeDelay(35);

    const ok = d31 === 30000 && d35 === 30000;
    results.push({
      name: 'Attempt 31+ saturates at maxDelay without negative overflow',
      passed: ok,
      error: ok ? null : `Got d31=${d31}, d35=${d35}`,
      is_hidden: false
    });
  } catch (err) {
    results.push({ name: 'Attempt 31+ saturates at maxDelay without negative overflow', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Extreme high attempt safe saturation (hidden)
  try {
    const policy = new RetryPolicy(500, 60000);
    const d100 = policy.computeDelay(100);
    const ok = d100 === 60000;
    results.push({ name: 'Hidden: Attempt 100 does not produce NaN or Infinity', passed: ok, error: ok ? null : `Got: ${d100}`, is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Attempt 100 does not produce NaN or Infinity', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/retry_policy.js',
                        'content' => <<<'JS'
class RetryPolicy {
  constructor(baseDelayMs = 1000, maxDelayMs = 30000) {
    this.baseDelayMs = baseDelayMs;
    this.maxDelayMs = maxDelayMs;
  }

  /**
   * Computes backoff delay for given attempt count (0-indexed).
   * @param {number} attempt
   * @returns {number} Delay in milliseconds
   */
  computeDelay(attempt) {
    if (attempt < 0) return this.baseDelayMs;

    // Use Math.pow instead of bitwise shift to avoid 32-bit signed integer overflow
    const factor = Math.pow(2, attempt);
    const delay = factor * this.baseDelayMs;
    return Math.min(delay, this.maxDelayMs);
  }
}

module.exports = { RetryPolicy };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['Bitwise Operators', 'Integer Overflow', 'Exponential Backoff', 'Reliability'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Inspect the power calculation',
                        'content' => 'What happens in JavaScript when you evaluate `1 << 31`?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Avoid 32-bit bitwise shift',
                        'content' => 'Bitwise operators force 32-bit signed representation. Standard arithmetic functions like `Math.pow()` work with 64-bit IEEE floats.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Replace `(1 << attempt)`',
                        'content' => 'Use `Math.pow(2, attempt)` instead of `(1 << attempt)`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'Change `const factor = (1 << attempt);` to `const factor = Math.pow(2, attempt);`. This ensures calculation stays positive and safely caps at `maxDelayMs`.'
                    ]
                ],
                'order_index' => 9,
            ],

            // -----------------------------------------------------------------
            // Quest 10: Financial Ledger 64-Bit Transaction ID Truncated by IEEE-754
            // -----------------------------------------------------------------
            [
                'slug' => 'json-bigint-precision-truncation',
                'title' => 'Financial Ledger 64-Bit Transaction ID Truncated by IEEE-754',
                'difficulty' => 'advanced',
                'category' => 'security_auth',
                'framework' => 'Node.js',
                'investigation_time_minutes' => 35,
                'description' => "Securities trade settlements mismatch by millions of dollars. Root-cause analysis uncovered that 64-bit snowflake order IDs sent over HTTP JSON endpoints exceed `Number.MAX_SAFE_INTEGER`, causing native JSON.parse to silently round the lowest significant digits.",
                'bug_report' => [
                    'issue_title' => 'JSON.parse silently truncates 64-bit integer order IDs',
                    'symptoms' => 'An incoming trade with order ID `9007199254740995` is recorded in the ledger with order ID `9007199254740996`, executing the trade against another customer\'s margin balance.',
                    'expected_behavior' => 'Large numeric transaction identifiers exceeding JavaScript\'s safe integer range (`9007199254740991`) must be preserved losslessly without float rounding.',
                    'actual_behavior' => 'In `src/order_parser.js`, `OrderParser.parse()` calls standard `JSON.parse()`. Since all numbers in standard JSON.parse are double-precision floats, precision beyond 53 bits is permanently lost.',
                    'reproduction_steps' => [
                        '1. Call `OrderParser.parse(\'{"orderId": 9007199254740995, "symbol": "AAPL"}\')`.',
                        '2. `result.orderId` becomes "9007199254740996" or float `9007199254740996`.'
                    ],
                    'environment' => 'Node.js v18+, CommonJS modules',
                    'scope_boundary' => 'Only edit `src/order_parser.js`. Do not modify test runner files.',
                ],
                'repository_files' => [
                    [
                        'path' => 'src/order_parser.js',
                        'is_editable' => true,
                        'language' => 'javascript',
                        'content' => <<<'JS'
class OrderParser {
  /**
   * Parses incoming financial trade batch JSON while preserving identifier precision.
   * @param {string} rawJson
   * @returns {Object}
   */
  static parse(rawJson) {
    // BUG: Standard JSON.parse coerces all numeric tokens to IEEE-754 floats.
    // Numbers exceeding Number.MAX_SAFE_INTEGER (9007199254740991) lose precision!
    return JSON.parse(rawJson);
  }
}

module.exports = { OrderParser };
JS
                    ],
                    [
                        'path' => 'tests/runner.cjs',
                        'is_editable' => false,
                        'language' => 'javascript',
                        'content' => <<<'JS'
const { OrderParser } = require('../src/order_parser');

function runTests() {
  const results = [];

  // Test 1: Standard payload
  try {
    const raw = '{"orderId": "ORD-101", "quantity": 50, "price": 142.50}';
    const parsed = OrderParser.parse(raw);
    const ok = parsed.orderId === 'ORD-101' && parsed.quantity === 50;
    results.push({ name: 'Parse standard order payload', passed: ok, error: ok ? null : 'Failed standard parsing', is_hidden: false });
  } catch (err) {
    results.push({ name: 'Parse standard order payload', passed: false, error: err.message, is_hidden: false });
  }

  // Test 2: 64-bit snowflake ID precision preservation (reproduction)
  try {
    // 9007199254740995 is MAX_SAFE_INTEGER + 4.
    // In IEEE 754 float, 9007199254740995 rounds to 9007199254740996!
    const targetId = '9007199254740995';
    const raw = `{"orderId": ${targetId}, "symbol": "NVDA", "shares": 100}`;
    const parsed = OrderParser.parse(raw);

    const stringifiedId = String(parsed.orderId);
    const ok = stringifiedId === targetId;

    results.push({
      name: 'Lossless preservation of 64-bit integer ID beyond MAX_SAFE_INTEGER',
      passed: ok,
      error: ok ? null : `Expected ID "${targetId}", got "${stringifiedId}" (rounded float)`,
      is_hidden: false
    });
  } catch (err) {
    results.push({ name: 'Lossless preservation of 64-bit integer ID beyond MAX_SAFE_INTEGER', passed: false, error: err.message, is_hidden: false });
  }

  // Test 3: Array of 64-bit IDs (hidden)
  try {
    const id1 = '9007199254740993';
    const id2 = '9007199254740997';
    const raw = `{"transactions": [{"id": ${id1}}, {"id": ${id2}}]}`;
    const parsed = OrderParser.parse(raw);

    const ok = String(parsed.transactions[0].id) === id1 && String(parsed.transactions[1].id) === id2;
    results.push({ name: 'Hidden: Array of 64-bit IDs preserved', passed: ok, error: ok ? null : 'Array IDs rounded', is_hidden: true });
  } catch (err) {
    results.push({ name: 'Hidden: Array of 64-bit IDs preserved', passed: false, error: err.message, is_hidden: true });
  }

  console.log('BUGQUEST_REPORT_START');
  console.log(JSON.stringify({ tests: results }));
  console.log('BUGQUEST_REPORT_END');

  const allPassed = results.every(r => r.passed);
  process.exit(allPassed ? 0 : 1);
}

runTests();
JS
                    ]
                ],
                'reference_patch' => [
                    [
                        'path' => 'src/order_parser.js',
                        'content' => <<<'JS'
class OrderParser {
  /**
   * Parses incoming financial trade batch JSON while preserving identifier precision.
   * @param {string} rawJson
   * @returns {Object}
   */
  static parse(rawJson) {
    // Preserve 64-bit integers exceeding 15 digits by quoting them before JSON.parse
    const safeJson = rawJson.replace(/:\s*([0-9]{15,})\b/g, ': "$1"');
    return JSON.parse(safeJson);
  }
}

module.exports = { OrderParser };
JS
                    ]
                ],
                'entrypoint_test' => 'tests/runner.cjs',
                'supported_languages' => ['javascript'],
                'topics' => ['IEEE-754', 'BigInt', 'Data Loss', 'Financial Transactions'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Check safe integer limits',
                        'content' => 'What is `Number.MAX_SAFE_INTEGER` in JavaScript, and what happens when an integer in JSON exceeds it?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Convert big numbers before parsing',
                        'content' => 'Before `JSON.parse` evaluates the string, large unquoted numeric literals can be quoted as strings or parsed with a custom tokenizer.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Regex string quotation',
                        'content' => 'Use a regex like `rawJson.replace(/:\\s*([0-9]{15,})\\b/g, \': "$1"\')` before passing to `JSON.parse`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full fix walkthrough',
                        'content' => 'In `src/order_parser.js`, preprocess the raw JSON string with regex replacement to wrap numeric tokens with 15+ digits in quotation marks, preserving their exact digits as strings.'
                    ]
                ],
                'order_index' => 10,
            ]
        ];

        foreach ($challenges as $c) {
            Challenge::updateOrCreate(
                ['slug' => $c['slug']],
                [
                    'title' => $c['title'],
                    'difficulty' => $c['difficulty'],
                    'category' => $c['category'],
                    'framework' => $c['framework'],
                    'investigation_time_minutes' => $c['investigation_time_minutes'],
                    'description' => $c['description'],
                    'bug_report' => $c['bug_report'],
                    'repository_files' => $c['repository_files'],
                    'reference_patch' => $c['reference_patch'],
                    'entrypoint_test' => $c['entrypoint_test'],
                    'supported_languages' => $c['supported_languages'],
                    'topics' => $c['topics'],
                    'hints' => $c['hints'],
                    'time_limit_ms' => 2000,
                    'memory_limit_mb' => 128,
                    'order_index' => $c['order_index'],
                    'is_active' => true,
                ]
            );
        }
    }
}
