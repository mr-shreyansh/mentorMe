export type ProblemLink = {
  title: string;
  url: string;
  id: string;
};

export type Subtopic = {
  id: string;
  title: string;
  examples: ProblemLink[];
  pseudocode: string;
};

export type TopicData = {
  id: string;
  title: string;
  description: string;
  subtopics: Subtopic[];
};

export const dsaTopics: Record<string, TopicData> = {
  greedy: {
    id: "greedy",
    title: "Greedy Algorithms",
    description: "Make the locally optimal choice at each stage with the hope of finding a global optimum.",
    subtopics: [
      {
        id: "basic-greedy",
        title: "1. Basic Greedy (Sorting + Local Choice)",
        examples: [
          { id: "greedy-1", title: "Assign Cookies (LC 455)", url: "#" },
          { id: "greedy-2", title: "Maximum Units on a Truck (LC 1710)", url: "#" },
          { id: "greedy-3", title: "Minimum Number of Arrows to Burst Balloons (LC 452)", url: "#" },
          { id: "greedy-4", title: "Non-overlapping Intervals (LC 435)", url: "#" }
        ],
        pseudocode: `sort(arr)
for item in arr:
    if valid choice:
        take it`
      },
      {
        id: "interval-scheduling",
        title: "2. Interval Scheduling / Merging",
        examples: [
          { id: "greedy-5", title: "Merge Intervals (LC 56)", url: "#" },
          { id: "greedy-6", title: "Insert Interval (LC 57)", url: "#" },
          { id: "greedy-7", title: "Partition Labels (LC 763)", url: "#" },
          { id: "greedy-8", title: "Meeting Rooms II (LC 253)", url: "#" }
        ],
        pseudocode: `sort by start time
for interval in intervals:
    if overlap:
        merge/update
    else:
        add new interval`
      },
      {
        id: "jump-reachability",
        title: "3. Jump / Reachability Greedy",
        examples: [
          { id: "greedy-9", title: "Jump Game (LC 55)", url: "#" },
          { id: "greedy-10", title: "Jump Game II (LC 45)", url: "#" },
          { id: "greedy-11", title: "Minimum Number of Refueling Stops (LC 871)", url: "#" }
        ],
        pseudocode: `farthest = 0
for i:
    if i > farthest: return false
    farthest = max(farthest, i + nums[i])`
      },
      {
        id: "greedy-heap",
        title: "4. Greedy with Heap / Priority Queue",
        examples: [
          { id: "greedy-12", title: "Course Schedule III (LC 630)", url: "#" },
          { id: "greedy-13", title: "Reorganize String (LC 767)", url: "#" },
          { id: "greedy-14", title: "Task Scheduler (LC 621)", url: "#" },
          { id: "greedy-15", title: "Furthest Building You Can Reach (LC 1642)", url: "#" }
        ],
        pseudocode: `for item:
    push into heap
    if constraint violated:
        pop worst element`
      },
      {
        id: "greedy-math",
        title: "5. Greedy + Sorting + Math Insight",
        examples: [
          { id: "greedy-16", title: "Gas Station (LC 134)", url: "#" },
          { id: "greedy-17", title: "Candy (LC 135)", url: "#" },
          { id: "greedy-18", title: "Minimum Platforms (classic)", url: "#" },
          { id: "greedy-19", title: "Eliminate Maximum Number of Monsters (LC 1921)", url: "#" }
        ],
        pseudocode: `tank = 0
start = 0
for i:
    tank += gain[i]
    if tank < 0:
        start = i+1
        tank = 0`
      },
      {
        id: "greedy-hard",
        title: "6. Hard Greedy / Advanced Patterns",
        examples: [
          { id: "greedy-20", title: "IPO (LC 502)", url: "#" },
          { id: "greedy-21", title: "Split Array into Consecutive Subsequences (LC 659)", url: "#" },
          { id: "greedy-22", title: "Minimum Cost to Hire K Workers (LC 857)", url: "#" },
          { id: "greedy-23", title: "Maximum Performance of a Team (LC 1383)", url: "#" }
        ],
        pseudocode: `sort by key
for item:
    add to heap
    maintain constraint
    update answer`
      },
      {
        id: "greedy-string",
        title: "7. String Greedy",
        examples: [
          { id: "greedy-24", title: "Remove K Digits (LC 402)", url: "#" },
          { id: "greedy-25", title: "Largest Number (LC 179)", url: "#" },
          { id: "greedy-26", title: "Smallest Subsequence of Distinct Characters (LC 1081)", url: "#" }
        ],
        pseudocode: `for char:
    while stack and better choice:
        pop
    push char`
      },
      {
        id: "greedy-binary-search",
        title: "8. Greedy + Binary Search Hybrid",
        examples: [
          { id: "greedy-27", title: "Capacity To Ship Packages Within D Days (LC 1011)", url: "#" },
          { id: "greedy-28", title: "Minimize Maximum Distance to Gas Station (LC 774)", url: "#" }
        ],
        pseudocode: `low, high
while low < high:
    mid = (low+high)//2
    if feasible(mid):
        high = mid
    else:
        low = mid+1`
      }
    ]
  },
  "sliding-window": {
    id: "sliding-window",
    title: "Sliding Window",
    description: "Maintain a dynamic window (subset of elements) to optimize problems looking for contiguous subsegments.",
    subtopics: [
      {
        id: "fixed-window",
        title: "1. Fixed Size Sliding Window",
        examples: [
          { id: "sw-1", title: "Maximum Average Subarray I (LC 643)", url: "#" },
          { id: "sw-2", title: "Maximum Number of Vowels in a Substring of Given Length (LC 1456)", url: "#" },
          { id: "sw-3", title: "Find All Anagrams in a String (LC 438)", url: "#" },
          { id: "sw-4", title: "Permutation in String (LC 567)", url: "#" }
        ],
        pseudocode: `window_sum = sum of first k elements
ans = window_sum
for i from k to n:
    window_sum += arr[i] - arr[i - k]
    ans = max(ans, window_sum)`
      },
      {
        id: "variable-window",
        title: "2. Variable Size Window (Grow + Shrink)",
        examples: [
          { id: "sw-5", title: "Longest Substring Without Repeating Characters (LC 3)", url: "#" },
          { id: "sw-6", title: "Longest Repeating Character Replacement (LC 424)", url: "#" },
          { id: "sw-7", title: "Max Consecutive Ones III (LC 1004)", url: "#" },
          { id: "sw-8", title: "Fruit Into Baskets (LC 904)", url: "#" }
        ],
        pseudocode: `left = 0
for right in range(n):
    add arr[right] to window
    while window is invalid:
        remove arr[left] from window
        left += 1
    update answer with valid window size (right - left + 1)`
      },
      {
        id: "min-valid-window",
        title: "3. Minimum / Valid Window Problems",
        examples: [
          { id: "sw-9", title: "Minimum Window Substring (LC 76)", url: "#" },
          { id: "sw-10", title: "Minimum Size Subarray Sum (LC 209)", url: "#" },
          { id: "sw-11", title: "Shortest Subarray with Sum at Least K (LC 862)", url: "#" }
        ],
        pseudocode: `left = 0
ans = infinity
for right in range(n):
    add arr[right] to window
    while window meets condition:
        ans = min(ans, right - left + 1)
        remove arr[left] from window
        left += 1`
      },
      {
        id: "at-most-k",
        title: "4. At Most K / Exactly K Pattern",
        examples: [
          { id: "sw-12", title: "Subarrays with K Different Integers (LC 992)", url: "#" },
          { id: "sw-13", title: "Count Number of Nice Subarrays (LC 1248)", url: "#" },
          { id: "sw-14", title: "Binary Subarrays With Sum (LC 930)", url: "#" },
          { id: "sw-15", title: "Number of Substrings Containing All Three Characters (LC 1358)", url: "#" }
        ],
        pseudocode: `function atMost(k):
    left = 0, count = 0
    for right in range(n):
        add arr[right] to window
        while window constraint > k:
            remove arr[left]
            left += 1
        count += (right - left + 1)
    return count
    
return atMost(K) - atMost(K - 1)  // For exactly K`
      },
      {
        id: "freq-constraint",
        title: "5. Frequency Constraint Windows",
        examples: [
          { id: "sw-16", title: "Longest Substring with At Most K Distinct Characters (LC 340)", url: "#" },
          { id: "sw-17", title: "Longest Substring with At Most Two Distinct Characters (LC 159)", url: "#" },
          { id: "sw-18", title: "Frequency of the Most Frequent Element (LC 1838)", url: "#" }
        ],
        pseudocode: `left = 0
freq_map = {}
for right in range(n):
    freq_map[arr[right]]++
    while len(freq_map) > k:
        freq_map[arr[left]]--
        if freq_map[arr[left]] == 0:
            del freq_map[arr[left]]
        left += 1
    ans = max(ans, right - left + 1)`
      },
      {
        id: "monotonic-deque",
        title: "6. Monotonic Deque (Advanced)",
        examples: [
          { id: "sw-19", title: "Sliding Window Maximum (LC 239)", url: "#" },
          { id: "sw-20", title: "Constrained Subsequence Sum (LC 1425)", url: "#" },
          { id: "sw-21", title: "Jump Game VI (LC 1696)", url: "#" }
        ],
        pseudocode: `deque = []
for i in range(n):
    while deque and deque.front() < i - k:
        deque.pop_front()
    while deque and nums[deque.back()] < nums[i]:
        deque.pop_back()
    deque.push_back(i)
    if i >= k - 1:
        ans.append(nums[deque.front()])`
      },
      {
        id: "counting-subarrays",
        title: "7. Counting Subarrays (r - l + 1 Trick)",
        examples: [
          { id: "sw-22", title: "Number of Subarrays with Bounded Maximum (LC 795)", url: "#" },
          { id: "sw-23", title: "Count Subarrays With Score Less Than K (LC 2302)", url: "#" },
          { id: "sw-24", title: "Subarray Product Less Than K (LC 713)", url: "#" }
        ],
        pseudocode: `left = 0
ans = 0
for right in range(n):
    update state with arr[right]
    while state is invalid:
        remove arr[left]
        left += 1
    ans += current_valid_combinations(right, left)`
      },
      {
        id: "hard-sliding-window",
        title: "8. Hard Sliding Window Problems",
        examples: [
          { id: "sw-25", title: "Substring with Concatenation of All Words (LC 30)", url: "#" },
          { id: "sw-26", title: "Minimum Window Subsequence (LC 727)", url: "#" },
          { id: "sw-27", title: "Longest Substring with At Least K Repeating Characters (LC 395)", url: "#" }
        ],
        pseudocode: `// Often requires two pointers with multiple passes or complex nested state tracking
for attempt in range(variations):
    left = 0
    state = reset()
    for right in range(n):
        // complex window logic`
      }
    ]
  },
  dp: {
    id: "dp",
    title: "Dynamic Programming",
    description: "Solve complex problems by breaking them down into simpler subproblems and storing the results.",
    subtopics: [
      {
        id: "knapsack",
        title: "0/1 Knapsack",
        examples: [],
        pseudocode: `function knapsack(W, wt, val, n):
  K = 2D array of size (n+1) x (W+1)
  for i = 0 to n:
    for w = 0 to W:
      if i == 0 or w == 0:
        K[i][w] = 0
      else if wt[i-1] <= w:
        K[i][w] = max(val[i-1] + K[i-1][w-wt[i-1]], K[i-1][w])
      else:
        K[i][w] = K[i-1][w]
  return K[n][W]`
      }
    ]
  },
  tree: {
    id: "tree",
    title: "Trees",
    description: "Hierarchical data structure consisting of nodes.",
    subtopics: [
      {
        id: "bst-traversal",
        title: "Binary Search Tree Traversal",
        examples: [],
        pseudocode: `function inorder(node):
  if node != null:
    inorder(node.left)
    print node.value
    inorder(node.right)`
      }
    ]
  },
  graph: {
    id: "graph",
    title: "Graphs",
    description: "Structures used to model pairwise relations between objects.",
    subtopics: [
      {
        id: "bfs",
        title: "Breadth-First Search (BFS)",
        examples: [],
        pseudocode: `function BFS(G, s):
  for each vertex u in G.V - {s}:
    u.color = WHITE
    u.d = INF
    u.pi = NIL
  s.color = GRAY
  s.d = 0
  Q = empty queue
  ENQUEUE(Q, s)
  while Q is not empty:
    u = DEQUEUE(Q)
    for each v in G.Adj[u]:
      if v.color == WHITE:
        v.color = GRAY
        v.d = u.d + 1
        v.pi = u
        ENQUEUE(Q, v)
    u.color = BLACK`
      }
    ]
  }
};
