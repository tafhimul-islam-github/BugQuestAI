<?php

namespace Database\Seeders;

use App\Models\Challenge;
use App\Models\ChallengeTestCase;
use Illuminate\Database\Seeder;

class ChallengeSeeder extends Seeder
{
    public function run(): void
    {
        $challenges = [
            [
                'slug' => 'two-sum-target-finder',
                'title' => 'Two Sum Target Finder',
                'difficulty' => 'beginner',
                'description' => "Given an array of integers `nums` and an integer `target`, return the indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order (as a JSON array formatted as `[index1, index2]`).",
                'input_spec' => "Line 1: Comma-separated integers representing nums (e.g., `2,7,11,15`)\nLine 2: Single integer representing target (e.g., `9`)",
                'output_spec' => "JSON array of two 0-based indices, e.g. `[0,1]`",
                'constraints' => [
                    "2 <= nums.length <= 10^4",
                    "-10^9 <= nums[i] <= 10^9",
                    "-10^9 <= target <= 10^9",
                    "Only one valid answer exists."
                ],
                'public_examples' => [
                    [
                        'input' => "2,7,11,15\n9",
                        'output' => "[0,1]",
                        'explanation' => "Because nums[0] + nums[1] == 2 + 7 == 9, we return [0, 1]."
                    ],
                    [
                        'input' => "3,2,4\n6",
                        'output' => "[1,2]",
                        'explanation' => "nums[1] + nums[2] == 2 + 4 == 6, return [1, 2]."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "// Read input from standard input\nconst fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim().split('\\n');\nif (input.length < 2) process.exit(0);\n\nconst nums = input[0].split(',').map(Number);\nconst target = Number(input[1]);\n\nfunction twoSum(nums, target) {\n    // TODO: Return [i, j] indices that sum to target\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}\n\nconsole.log(JSON.stringify(twoSum(nums, target)));",
                    'python' => "import sys, json\n\nlines = sys.stdin.read().strip().splitlines()\nif not lines: sys.exit(0)\n\nnums = [int(x) for x in lines[0].split(',')]\ntarget = int(lines[1])\n\ndef two_sum(nums, target):\n    # TODO: Implement hash map lookup\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []\n\nprint(json.dumps(two_sum(nums, target)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['arrays', 'hash_maps', 'lookup'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Think in complements',
                        'content' => 'For every number X you see, what exact other number Y would you need so that X + Y = target?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Avoid O(n^2) nested loops',
                        'content' => 'A brute-force loop checks every pair in O(n^2). How can a Hash Map (or Object / dictionary) store previously seen numbers for O(1) lookups?'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Key-Value storage order',
                        'content' => 'When inserting into your map, store `nums[i]` as the key and the index `i` as the value. Check if `target - nums[i]` exists before setting the current index.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Full algorithm walkthrough',
                        'content' => 'Iterate through the array with index `i`. Compute `complement = target - nums[i]`. If `complement` is in our map, return `[map[complement], i]`. Otherwise, record `map[nums[i]] = i`. Time complexity is O(N) and space complexity is O(N).'
                    ]
                ],
                'editorial' => "### Optimal Hash Map Approach\nInstead of checking every pair with nested loops (which runs in quadratic O(N^2) time), we can maintain a hash map of elements we have visited so far.\n\nAs we inspect each number `x`, we check if `target - x` is already in the map. If it is, we have found our answer in a single pass.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 1,
                'test_cases' => [
                    ['input' => "2,7,11,15\n9", 'expected_output' => "[0,1]", 'is_hidden' => false, 'explanation' => 'Example 1'],
                    ['input' => "3,2,4\n6", 'expected_output' => "[1,2]", 'is_hidden' => false, 'explanation' => 'Example 2'],
                    ['input' => "3,3\n6", 'expected_output' => "[0,1]", 'is_hidden' => true, 'explanation' => 'Duplicate elements'],
                    ['input' => "-1,-2,-3,-4,-5\n-8", 'expected_output' => "[2,4]", 'is_hidden' => true, 'explanation' => 'Negative integers'],
                    ['input' => "1000,2000,3000,4000\n7000", 'expected_output' => "[2,3]", 'is_hidden' => true, 'explanation' => 'Larger integers'],
                ]
            ],
            [
                'slug' => 'valid-palindrome-sanitizer',
                'title' => 'Valid Palindrome Sanitizer',
                'difficulty' => 'beginner',
                'description' => "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\nGiven a string `s`, return `true` if it is a palindrome, or `false` otherwise.",
                'input_spec' => "A single line containing the raw string `s`.",
                'output_spec' => "`true` or `false`",
                'constraints' => [
                    "1 <= s.length <= 2 * 10^5",
                    "`s` consists only of printable ASCII characters."
                ],
                'public_examples' => [
                    [
                        'input' => "A man, a plan, a canal: Panama",
                        'output' => "true",
                        'explanation' => "\"amanaplanacanalpanama\" is a palindrome."
                    ],
                    [
                        'input' => "race a car",
                        'output' => "false",
                        'explanation' => "\"raceacar\" is not a palindrome."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isPalindrome(s) {\n    // TODO: Sanitize string to lowercase alphanumeric and verify symmetry\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return clean === clean.split('').reverse().join('');\n}\n\nconsole.log(isPalindrome(s));",
                    'python' => "import sys\ns = sys.stdin.read().strip()\n\ndef is_palindrome(s: str) -> bool:\n    # TODO: Filter characters and test symmetry\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]\n\nprint(str(is_palindrome(s)).lower())"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['strings', 'two_pointers', 'sanitization'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Ignore noise',
                        'content' => 'Punctuation, spaces, and case differences should not affect the symmetry comparison.'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Two Pointers vs Array Reverse',
                        'content' => 'You can either filter the string to lowercase alphanumeric characters, or maintain two pointers `left` and `right` skipping non-alphanumeric characters in-place.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Empty cleaned string',
                        'content' => 'If the string contains only punctuation like \" \", the cleaned string is empty \"\". By definition, an empty string reads the same forwards and backwards.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Two-Pointer Walkthrough',
                        'content' => 'Set `left = 0` and `right = s.length - 1`. While `left < right`: skip if `s[left]` is not alphanumeric; skip if `s[right]` is not alphanumeric; if `s[left].toLowerCase() != s[right].toLowerCase()`, return false. Increment left and decrement right. Return true.'
                    ]
                ],
                'editorial' => "### Two Pointer Comparison\nThis problem tests basic string filtering and two-pointer traversal. Sanitizing first produces an O(N) memory solution, while two-pointers in-place produces O(1) auxiliary space.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 2,
                'test_cases' => [
                    ['input' => "A man, a plan, a canal: Panama", 'expected_output' => "true", 'is_hidden' => false, 'explanation' => 'Classic example'],
                    ['input' => "race a car", 'expected_output' => "false", 'is_hidden' => false, 'explanation' => 'Not a palindrome'],
                    ['input' => " ", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Empty whitespace string'],
                    ['input' => "0P", 'expected_output' => "false", 'is_hidden' => true, 'explanation' => 'Numeric and letter mix'],
                    ['input' => "No 'x' in Nixon", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Special punctuation'],
                ]
            ],
            [
                'slug' => 'balanced-brackets-validator',
                'title' => 'Balanced Brackets Validator',
                'difficulty' => 'intermediate',
                'description' => "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
                'input_spec' => "A single line containing bracket characters `s`.",
                'output_spec' => "`true` or `false`",
                'constraints' => [
                    "1 <= s.length <= 10^4",
                    "`s` consists of parentheses only `'()[]{}'`."
                ],
                'public_examples' => [
                    [
                        'input' => "()[]{}",
                        'output' => "true",
                        'explanation' => "All opened brackets are closed in order."
                    ],
                    [
                        'input' => "(]",
                        'output' => "false",
                        'explanation' => "Bracket types do not match."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').trim();\n\nfunction isValid(s) {\n    // TODO: Use a stack to track matching opening brackets\n    const stack = [];\n    const pairs = { ')': '(', '}': '{', ']': '[' };\n    for (const char of s) {\n        if (char === '(' || char === '{' || char === '[') {\n            stack.push(char);\n        } else {\n            if (stack.pop() !== pairs[char]) return false;\n        }\n    }\n    return stack.length === 0;\n}\n\nconsole.log(isValid(s));",
                    'python' => "import sys\ns = sys.stdin.read().strip()\n\ndef is_valid(s: str) -> bool:\n    stack = []\n    pairs = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in '({[':\n            stack.append(char)\n        else:\n            if not stack or stack.pop() != pairs.get(char):\n                return False\n    return len(stack) == 0\n\nprint(str(is_valid(s)).lower())"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['stacks', 'parsing', 'data_structures'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Last opened, first closed',
                        'content' => 'The most recently opened bracket must be the very first one to close. Which data structure fits this LIFO behavior?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Stack push and pop',
                        'content' => 'Push opening brackets `(`, `{`, `[` onto a stack. When encountering a closing bracket, pop from the stack and verify that it matches.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Watch out for empty stack pops',
                        'content' => 'What happens if the string begins with a closing bracket like `]`? Popping an empty stack must immediately return false.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Complete Stack Logic',
                        'content' => 'Maintain an array `stack`. Loop through each character. If it is an opener, `stack.push(char)`. If it is a closer, verify `stack.length > 0` and `stack.pop() === matchingOpener`. Finally, check `stack.length === 0` (no unclosed openers).'
                    ]
                ],
                'editorial' => "### Stack Data Structure\nUsing a Stack guarantees O(N) time and O(N) space. It properly tracks nested brackets because the innermost bracket must match first.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 3,
                'test_cases' => [
                    ['input' => "()[]{}", 'expected_output' => "true", 'is_hidden' => false, 'explanation' => 'Sequential matching brackets'],
                    ['input' => "(]", 'expected_output' => "false", 'is_hidden' => false, 'explanation' => 'Mismatched closing bracket'],
                    ['input' => "([{}])", 'expected_output' => "true", 'is_hidden' => true, 'explanation' => 'Deeply nested brackets'],
                    ['input' => "]", 'expected_output' => "false", 'is_hidden' => true, 'explanation' => 'Closing bracket with empty stack'],
                    ['input' => "(((((", 'expected_output' => "false", 'is_hidden' => true, 'explanation' => 'Unclosed open brackets'],
                ]
            ],
            [
                'slug' => 'merge-overlapping-intervals',
                'title' => 'Merge Overlapping Intervals',
                'difficulty' => 'intermediate',
                'description' => "Given an array of `intervals` where `intervals[i] = [start_i, end_i]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.\n\nInput format: JSON string representing an array of intervals, e.g. `[[1,3],[2,6],[8,10],[15,18]]`.\nOutput format: JSON string of merged intervals, sorted by start time.",
                'input_spec' => "A single line containing JSON array of pairs, e.g. `[[1,3],[2,6],[8,10],[15,18]]`",
                'output_spec' => "JSON array of merged pairs, e.g. `[[1,6],[8,10],[15,18]]`",
                'constraints' => [
                    "1 <= intervals.length <= 10^4",
                    "intervals[i].length == 2",
                    "0 <= start_i <= end_i <= 10^4"
                ],
                'public_examples' => [
                    [
                        'input' => "[[1,3],[2,6],[8,10],[15,18]]",
                        'output' => "[[1,6],[8,10],[15,18]]",
                        'explanation' => "Since intervals [1,3] and [2,6] overlap, merge them into [1,6]."
                    ],
                    [
                        'input' => "[[1,4],[4,5]]",
                        'output' => "[[1,5]]",
                        'explanation' => "Intervals [1,4] and [4,5] are considered overlapping."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst intervals = JSON.parse(input);\n\nfunction merge(intervals) {\n    if (!intervals.length) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const merged = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const current = intervals[i];\n        const last = merged[merged.length - 1];\n        if (current[0] <= last[1]) {\n            last[1] = Math.max(last[1], current[1]);\n        } else {\n            merged.push(current);\n        }\n    }\n    return merged;\n}\n\nconsole.log(JSON.stringify(merge(intervals)));",
                    'python' => "import sys, json\nintervals = json.loads(sys.stdin.read().strip())\n\ndef merge(intervals):\n    if not intervals:\n        return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for current in intervals[1:]:\n        last = merged[-1]\n        if current[0] <= last[1]:\n            last[1] = max(last[1], current[1])\n        else:\n            merged.append(current)\n    return merged\n\nprint(json.dumps(merge(intervals)))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['sorting', 'arrays', 'intervals'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Sort first',
                        'content' => 'If the intervals are randomly ordered, checking for overlaps requires comparisons across all pairs. Can sorting by start time simplify this?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Linear scan after sort',
                        'content' => 'Once sorted by start time, each interval can only overlap with the immediately preceding merged interval.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Updating the upper bound',
                        'content' => 'When interval `current` overlaps with `last` (`current[0] <= last[1]`), remember that `current[1]` might be smaller or larger than `last[1]`. Use `Math.max(last[1], current[1])`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Sorting and Greedy Merge',
                        'content' => 'Sort `intervals` by `start` in ascending order. Initialize `merged = [intervals[0]]`. For each interval `[start, end]`: if `start <= merged.last.end`, update `merged.last.end = max(merged.last.end, end)`. Otherwise, push `[start, end]`. Time complexity is O(N log N) dominated by sorting.'
                    ]
                ],
                'editorial' => "### Sort & Merge Pattern\nSorting guarantees that any interval that can possibly overlap with the current set must have a start time between `last.start` and `last.end`.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 4,
                'test_cases' => [
                    ['input' => "[[1,3],[2,6],[8,10],[15,18]]", 'expected_output' => "[[1,6],[8,10],[15,18]]", 'is_hidden' => false, 'explanation' => 'Example 1'],
                    ['input' => "[[1,4],[4,5]]", 'expected_output' => "[[1,5]]", 'is_hidden' => false, 'explanation' => 'Adjacent overlapping boundary'],
                    ['input' => "[[1,4],[2,3]]", 'expected_output' => "[[1,4]]", 'is_hidden' => true, 'explanation' => 'Complete containment'],
                    ['input' => "[[2,3],[4,5],[6,7],[8,9],[1,10]]", 'expected_output' => "[[1,10]]", 'is_hidden' => true, 'explanation' => 'Unsorted with spanning outer interval'],
                ]
            ],
            [
                'slug' => 'longest-substring-without-repeating',
                'title' => 'Longest Substring Without Repeating Characters',
                'difficulty' => 'advanced',
                'description' => "Given a string `s`, find the length of the longest substring without repeating characters.\n\nA substring is a contiguous non-empty sequence of characters within a string.",
                'input_spec' => "A single line containing string `s`.",
                'output_spec' => "An integer representing the maximum length.",
                'constraints' => [
                    "0 <= s.length <= 5 * 10^4",
                    "`s` consists of English letters, digits, symbols and spaces."
                ],
                'public_examples' => [
                    [
                        'input' => "abcabcbb",
                        'output' => "3",
                        'explanation' => "The answer is \"abc\", with the length of 3."
                    ],
                    [
                        'input' => "bbbbb",
                        'output' => "1",
                        'explanation' => "The answer is \"b\", with the length of 1."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst s = fs.readFileSync(0, 'utf-8').replace(/\\r?\\n$/, '');\n\nfunction lengthOfLongestSubstring(s) {\n    // TODO: Implement sliding window with character index map\n    const seen = new Map();\n    let maxLen = 0;\n    let left = 0;\n    for (let right = 0; right < s.length; right++) {\n        const char = s[right];\n        if (seen.has(char) && seen.get(char) >= left) {\n            left = seen.get(char) + 1;\n        }\n        seen.set(char, right);\n        maxLen = Math.max(maxLen, right - left + 1);\n    }\n    return maxLen;\n}\n\nconsole.log(lengthOfLongestSubstring(s));",
                    'python' => "import sys\ns = sys.stdin.read().rstrip('\\r\\n')\n\ndef length_of_longest_substring(s: str) -> int:\n    seen = {}\n    max_len = 0\n    left = 0\n    for right, char in enumerate(s):\n        if char in seen and seen[char] >= left:\n            left = seen[char] + 1\n        seen[char] = right\n        max_len = max(max_len, right - left + 1)\n    return max_len\n\nprint(length_of_longest_substring(s))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['sliding_window', 'hash_maps', 'strings'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Sliding window technique',
                        'content' => 'Can you maintain a window `[left, right]` where all characters inside the window are guaranteed to be unique?'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Tracking the last seen position',
                        'content' => 'Store the last seen index of each character. When a duplicate is encountered, move `left` to one position past the previous occurrence.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Preventing left pointer from moving backwards',
                        'content' => 'Be careful! If a character was seen at index 2, but `left` is already at index 5, you must NOT move `left` backwards. Only advance `left` if `seen[char] >= left`.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Optimal O(N) Sliding Window',
                        'content' => 'Use a map to store `char -> last_index`. Iterate `right` from 0 to N-1. If `char` is in map and `map[char] >= left`, set `left = map[char] + 1`. Record `map[char] = right`. Update `maxLen = max(maxLen, right - left + 1)`. Total time is O(N) single pass.'
                    ]
                ],
                'editorial' => "### Sliding Window with Hash Map\nA naive check tests all substrings in O(N^3) time. With a sliding window and index dictionary, we advance `right` continuously and jump `left` past duplicates in linear O(N) time.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 5,
                'test_cases' => [
                    ['input' => "abcabcbb", 'expected_output' => "3", 'is_hidden' => false, 'explanation' => 'Classic repetition'],
                    ['input' => "bbbbb", 'expected_output' => "1", 'is_hidden' => false, 'explanation' => 'All same character'],
                    ['input' => "pwwkew", 'expected_output' => "3", 'is_hidden' => true, 'explanation' => 'Substring wke with repetition before and after'],
                    ['input' => "", 'expected_output' => "0", 'is_hidden' => true, 'explanation' => 'Empty string boundary case'],
                    ['input' => "aab", 'expected_output' => "2", 'is_hidden' => true, 'explanation' => 'Duplicate at beginning'],
                ]
            ],
            [
                'slug' => 'missing-number-xor-math',
                'title' => 'Missing Number in Array',
                'difficulty' => 'beginner',
                'description' => "Given an array `nums` containing `n` distinct numbers in the range `[0, n]`, return the only number in the range that is missing from the array.\n\nInput format: Comma-separated integers (e.g. `3,0,1`).\nOutput format: The single missing integer.",
                'input_spec' => "Line 1: Comma-separated integers, e.g. `3,0,1`",
                'output_spec' => "Single integer representing the missing number, e.g. `2`",
                'constraints' => [
                    "n == nums.length",
                    "1 <= n <= 10^4",
                    "0 <= nums[i] <= n",
                    "All numbers of nums are unique."
                ],
                'public_examples' => [
                    [
                        'input' => "3,0,1",
                        'output' => "2",
                        'explanation' => "n = 3 since there are 3 numbers, so all numbers are in the range [0,3]. 2 is the missing number."
                    ],
                    [
                        'input' => "0,1",
                        'output' => "2",
                        'explanation' => "n = 2, [0,2]. 2 is missing."
                    ]
                ],
                'starter_code' => [
                    'javascript' => "const fs = require('fs');\nconst input = fs.readFileSync(0, 'utf-8').trim();\nconst nums = input.split(',').map(Number);\n\nfunction missingNumber(nums) {\n    // TODO: Find missing number using Gauss sum: n*(n+1)/2 or XOR\n    const n = nums.length;\n    const expectedSum = (n * (n + 1)) / 2;\n    const actualSum = nums.reduce((acc, curr) => acc + curr, 0);\n    return expectedSum - actualSum;\n}\n\nconsole.log(missingNumber(nums));",
                    'python' => "import sys\nnums = [int(x) for x in sys.stdin.read().strip().split(',')]\n\ndef missing_number(nums):\n    n = len(nums)\n    expected_sum = n * (n + 1) // 2\n    actual_sum = sum(nums)\n    return expected_sum - actual_sum\n\nprint(missing_number(nums))"
                ],
                'supported_languages' => ['javascript', 'python'],
                'topics' => ['math', 'arrays', 'bit_manipulation'],
                'hints' => [
                    [
                        'level' => 'nudge',
                        'title' => 'Arithmetic series sum',
                        'content' => 'What is the sum of integers from 0 to N? Formula: N * (N + 1) / 2.'
                    ],
                    [
                        'level' => 'direction',
                        'title' => 'Difference between sums',
                        'content' => 'The difference between the expected total sum and the actual sum of elements in `nums` gives the missing element directly.'
                    ],
                    [
                        'level' => 'debugging_guidance',
                        'title' => 'Constant memory O(1)',
                        'content' => 'You do not need to sort or use extra arrays or sets. Arithmetic sum or bitwise XOR provides O(N) time and O(1) space.'
                    ],
                    [
                        'level' => 'detailed_explanation',
                        'title' => 'Gauss Sum Walkthrough',
                        'content' => 'Compute `n = nums.length`. The expected sum of numbers `[0..n]` is `n*(n+1)/2`. Sum all elements in `nums`. Return `expectedSum - actualSum`.'
                    ]
                ],
                'editorial' => "### Mathematical / XOR Approach\nSumming integers from `0` to `n` takes O(1) formula calculation. Subtracting the actual array sum identifies the missing number in O(N) time and O(1) space.",
                'time_limit_ms' => 2000,
                'memory_limit_mb' => 128,
                'order_index' => 6,
                'test_cases' => [
                    ['input' => "3,0,1", 'expected_output' => "2", 'is_hidden' => false, 'explanation' => 'Missing 2'],
                    ['input' => "0,1", 'expected_output' => "2", 'is_hidden' => false, 'explanation' => 'Missing N (boundary)'],
                    ['input' => "9,6,4,2,3,5,7,0,1", 'expected_output' => "8", 'is_hidden' => true, 'explanation' => 'Larger range missing 8'],
                    ['input' => "1", 'expected_output' => "0", 'is_hidden' => true, 'explanation' => 'Single element missing 0'],
                ]
            ]
        ];

        foreach ($challenges as $data) {
            $testCases = $data['test_cases'];
            unset($data['test_cases']);

            $challenge = Challenge::updateOrCreate(
                ['slug' => $data['slug']],
                $data
            );

            // Clean up old test cases if re-seeding
            $challenge->testCases()->delete();

            foreach ($testCases as $idx => $tc) {
                ChallengeTestCase::create([
                    'challenge_id' => $challenge->id,
                    'input' => $tc['input'],
                    'expected_output' => $tc['expected_output'],
                    'is_hidden' => $tc['is_hidden'],
                    'explanation' => $tc['explanation'] ?? null,
                    'order_index' => $idx + 1,
                ]);
            }
        }
    }
}
