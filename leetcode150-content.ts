export interface Leetcode150Item {
  position: number; // 1-based index in the official Top Interview 150 order
  number: number; // LeetCode's own problem number
  title: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

// Official LeetCode "Top Interview 150" list, in the site's own topic-grouped
// order. `position` is 1-based and must stay contiguous — leetcode150-db.ts's
// pointer indexes into this array by position - 1.
export const LEETCODE_150: Leetcode150Item[] = [
  // Array / String
  { position: 1, number: 88, title: "Merge Sorted Array", topic: "Array / String", difficulty: "Easy" },
  { position: 2, number: 27, title: "Remove Element", topic: "Array / String", difficulty: "Easy" },
  { position: 3, number: 26, title: "Remove Duplicates from Sorted Array", topic: "Array / String", difficulty: "Easy" },
  { position: 4, number: 80, title: "Remove Duplicates from Sorted Array II", topic: "Array / String", difficulty: "Medium" },
  { position: 5, number: 169, title: "Majority Element", topic: "Array / String", difficulty: "Easy" },
  { position: 6, number: 189, title: "Rotate Array", topic: "Array / String", difficulty: "Medium" },
  { position: 7, number: 121, title: "Best Time to Buy and Sell Stock", topic: "Array / String", difficulty: "Easy" },
  { position: 8, number: 122, title: "Best Time to Buy and Sell Stock II", topic: "Array / String", difficulty: "Medium" },
  { position: 9, number: 55, title: "Jump Game", topic: "Array / String", difficulty: "Medium" },
  { position: 10, number: 45, title: "Jump Game II", topic: "Array / String", difficulty: "Medium" },
  { position: 11, number: 274, title: "H-Index", topic: "Array / String", difficulty: "Medium" },
  { position: 12, number: 380, title: "Insert Delete GetRandom O(1)", topic: "Array / String", difficulty: "Medium" },
  { position: 13, number: 238, title: "Product of Array Except Self", topic: "Array / String", difficulty: "Medium" },
  { position: 14, number: 134, title: "Gas Station", topic: "Array / String", difficulty: "Medium" },
  { position: 15, number: 135, title: "Candy", topic: "Array / String", difficulty: "Hard" },
  { position: 16, number: 42, title: "Trapping Rain Water", topic: "Array / String", difficulty: "Hard" },
  { position: 17, number: 13, title: "Roman to Integer", topic: "Array / String", difficulty: "Easy" },
  { position: 18, number: 12, title: "Integer to Roman", topic: "Array / String", difficulty: "Medium" },
  { position: 19, number: 58, title: "Length of Last Word", topic: "Array / String", difficulty: "Easy" },
  { position: 20, number: 14, title: "Longest Common Prefix", topic: "Array / String", difficulty: "Easy" },
  { position: 21, number: 151, title: "Reverse Words in a String", topic: "Array / String", difficulty: "Medium" },
  { position: 22, number: 6, title: "Zigzag Conversion", topic: "Array / String", difficulty: "Medium" },
  { position: 23, number: 28, title: "Find the Index of the First Occurrence in a String", topic: "Array / String", difficulty: "Easy" },
  { position: 24, number: 68, title: "Text Justification", topic: "Array / String", difficulty: "Hard" },

  // Two Pointers
  { position: 25, number: 125, title: "Valid Palindrome", topic: "Two Pointers", difficulty: "Easy" },
  { position: 26, number: 392, title: "Is Subsequence", topic: "Two Pointers", difficulty: "Easy" },
  { position: 27, number: 167, title: "Two Sum II - Input Array Is Sorted", topic: "Two Pointers", difficulty: "Medium" },
  { position: 28, number: 11, title: "Container With Most Water", topic: "Two Pointers", difficulty: "Medium" },
  { position: 29, number: 15, title: "3Sum", topic: "Two Pointers", difficulty: "Medium" },

  // Sliding Window
  { position: 30, number: 209, title: "Minimum Size Subarray Sum", topic: "Sliding Window", difficulty: "Medium" },
  { position: 31, number: 3, title: "Longest Substring Without Repeating Characters", topic: "Sliding Window", difficulty: "Medium" },
  { position: 32, number: 30, title: "Substring with Concatenation of All Words", topic: "Sliding Window", difficulty: "Hard" },
  { position: 33, number: 76, title: "Minimum Window Substring", topic: "Sliding Window", difficulty: "Hard" },

  // Matrix
  { position: 34, number: 36, title: "Valid Sudoku", topic: "Matrix", difficulty: "Medium" },
  { position: 35, number: 54, title: "Spiral Matrix", topic: "Matrix", difficulty: "Medium" },
  { position: 36, number: 48, title: "Rotate Image", topic: "Matrix", difficulty: "Medium" },
  { position: 37, number: 73, title: "Set Matrix Zeroes", topic: "Matrix", difficulty: "Medium" },
  { position: 38, number: 289, title: "Game of Life", topic: "Matrix", difficulty: "Medium" },

  // Hashmap
  { position: 39, number: 383, title: "Ransom Note", topic: "Hashmap", difficulty: "Easy" },
  { position: 40, number: 205, title: "Isomorphic Strings", topic: "Hashmap", difficulty: "Easy" },
  { position: 41, number: 290, title: "Word Pattern", topic: "Hashmap", difficulty: "Easy" },
  { position: 42, number: 242, title: "Valid Anagram", topic: "Hashmap", difficulty: "Easy" },
  { position: 43, number: 49, title: "Group Anagrams", topic: "Hashmap", difficulty: "Medium" },
  { position: 44, number: 1, title: "Two Sum", topic: "Hashmap", difficulty: "Easy" },
  { position: 45, number: 202, title: "Happy Number", topic: "Hashmap", difficulty: "Easy" },
  { position: 46, number: 219, title: "Contains Duplicate II", topic: "Hashmap", difficulty: "Easy" },
  { position: 47, number: 128, title: "Longest Consecutive Sequence", topic: "Hashmap", difficulty: "Medium" },

  // Intervals
  { position: 48, number: 228, title: "Summary Ranges", topic: "Intervals", difficulty: "Easy" },
  { position: 49, number: 56, title: "Merge Intervals", topic: "Intervals", difficulty: "Medium" },
  { position: 50, number: 57, title: "Insert Interval", topic: "Intervals", difficulty: "Medium" },
  { position: 51, number: 452, title: "Minimum Number of Arrows to Burst Balloons", topic: "Intervals", difficulty: "Medium" },

  // Stack
  { position: 52, number: 20, title: "Valid Parentheses", topic: "Stack", difficulty: "Easy" },
  { position: 53, number: 71, title: "Simplify Path", topic: "Stack", difficulty: "Medium" },
  { position: 54, number: 155, title: "Min Stack", topic: "Stack", difficulty: "Medium" },
  { position: 55, number: 150, title: "Evaluate Reverse Polish Notation", topic: "Stack", difficulty: "Medium" },
  { position: 56, number: 224, title: "Basic Calculator", topic: "Stack", difficulty: "Hard" },

  // Linked List
  { position: 57, number: 141, title: "Linked List Cycle", topic: "Linked List", difficulty: "Easy" },
  { position: 58, number: 2, title: "Add Two Numbers", topic: "Linked List", difficulty: "Medium" },
  { position: 59, number: 21, title: "Merge Two Sorted Lists", topic: "Linked List", difficulty: "Easy" },
  { position: 60, number: 138, title: "Copy List with Random Pointer", topic: "Linked List", difficulty: "Medium" },
  { position: 61, number: 92, title: "Reverse Linked List II", topic: "Linked List", difficulty: "Medium" },
  { position: 62, number: 25, title: "Reverse Nodes in k-Group", topic: "Linked List", difficulty: "Hard" },
  { position: 63, number: 19, title: "Remove Nth Node From End of List", topic: "Linked List", difficulty: "Medium" },
  { position: 64, number: 82, title: "Remove Duplicates from Sorted List II", topic: "Linked List", difficulty: "Medium" },
  { position: 65, number: 61, title: "Rotate List", topic: "Linked List", difficulty: "Medium" },
  { position: 66, number: 86, title: "Partition List", topic: "Linked List", difficulty: "Medium" },
  { position: 67, number: 146, title: "LRU Cache", topic: "Linked List", difficulty: "Medium" },

  // Binary Tree General
  { position: 68, number: 104, title: "Maximum Depth of Binary Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 69, number: 100, title: "Same Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 70, number: 226, title: "Invert Binary Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 71, number: 101, title: "Symmetric Tree", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 72, number: 105, title: "Construct Binary Tree from Preorder and Inorder Traversal", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 73, number: 106, title: "Construct Binary Tree from Inorder and Postorder Traversal", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 74, number: 117, title: "Populating Next Right Pointers in Each Node II", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 75, number: 114, title: "Flatten Binary Tree to Linked List", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 76, number: 112, title: "Path Sum", topic: "Binary Tree General", difficulty: "Easy" },
  { position: 77, number: 129, title: "Sum Root to Leaf Numbers", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 78, number: 124, title: "Binary Tree Maximum Path Sum", topic: "Binary Tree General", difficulty: "Hard" },
  { position: 79, number: 173, title: "Binary Search Tree Iterator", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 80, number: 222, title: "Count Complete Tree Nodes", topic: "Binary Tree General", difficulty: "Medium" },
  { position: 81, number: 236, title: "Lowest Common Ancestor of a Binary Tree", topic: "Binary Tree General", difficulty: "Medium" },

  // Binary Tree BFS
  { position: 82, number: 199, title: "Binary Tree Right Side View", topic: "Binary Tree BFS", difficulty: "Medium" },
  { position: 83, number: 637, title: "Average of Levels in Binary Tree", topic: "Binary Tree BFS", difficulty: "Easy" },
  { position: 84, number: 102, title: "Binary Tree Level Order Traversal", topic: "Binary Tree BFS", difficulty: "Medium" },
  { position: 85, number: 103, title: "Binary Tree Zigzag Level Order Traversal", topic: "Binary Tree BFS", difficulty: "Medium" },

  // Binary Search Tree
  { position: 86, number: 530, title: "Minimum Absolute Difference in BST", topic: "Binary Search Tree", difficulty: "Easy" },
  { position: 87, number: 230, title: "Kth Smallest Element in a BST", topic: "Binary Search Tree", difficulty: "Medium" },
  { position: 88, number: 98, title: "Validate Binary Search Tree", topic: "Binary Search Tree", difficulty: "Medium" },

  // Graph General
  { position: 89, number: 200, title: "Number of Islands", topic: "Graph General", difficulty: "Medium" },
  { position: 90, number: 130, title: "Surrounded Regions", topic: "Graph General", difficulty: "Medium" },
  { position: 91, number: 133, title: "Clone Graph", topic: "Graph General", difficulty: "Medium" },
  { position: 92, number: 399, title: "Evaluate Division", topic: "Graph General", difficulty: "Medium" },
  { position: 93, number: 207, title: "Course Schedule", topic: "Graph General", difficulty: "Medium" },
  { position: 94, number: 210, title: "Course Schedule II", topic: "Graph General", difficulty: "Medium" },

  // Graph BFS
  { position: 95, number: 909, title: "Snakes and Ladders", topic: "Graph BFS", difficulty: "Medium" },
  { position: 96, number: 433, title: "Minimum Genetic Mutation", topic: "Graph BFS", difficulty: "Medium" },
  { position: 97, number: 127, title: "Word Ladder", topic: "Graph BFS", difficulty: "Hard" },

  // Trie
  { position: 98, number: 208, title: "Implement Trie (Prefix Tree)", topic: "Trie", difficulty: "Medium" },
  { position: 99, number: 211, title: "Design Add and Search Words Data Structure", topic: "Trie", difficulty: "Medium" },
  { position: 100, number: 212, title: "Word Search II", topic: "Trie", difficulty: "Hard" },

  // Backtracking
  { position: 101, number: 17, title: "Letter Combinations of a Phone Number", topic: "Backtracking", difficulty: "Medium" },
  { position: 102, number: 77, title: "Combinations", topic: "Backtracking", difficulty: "Medium" },
  { position: 103, number: 46, title: "Permutations", topic: "Backtracking", difficulty: "Medium" },
  { position: 104, number: 39, title: "Combination Sum", topic: "Backtracking", difficulty: "Medium" },
  { position: 105, number: 52, title: "N-Queens II", topic: "Backtracking", difficulty: "Hard" },
  { position: 106, number: 22, title: "Generate Parentheses", topic: "Backtracking", difficulty: "Medium" },
  { position: 107, number: 79, title: "Word Search", topic: "Backtracking", difficulty: "Medium" },

  // Divide & Conquer
  { position: 108, number: 108, title: "Convert Sorted Array to Binary Search Tree", topic: "Divide & Conquer", difficulty: "Easy" },
  { position: 109, number: 148, title: "Sort List", topic: "Divide & Conquer", difficulty: "Medium" },
  { position: 110, number: 427, title: "Construct Quad Tree", topic: "Divide & Conquer", difficulty: "Medium" },
  { position: 111, number: 23, title: "Merge k Sorted Lists", topic: "Divide & Conquer", difficulty: "Hard" },

  // Kadane's Algorithm
  { position: 112, number: 53, title: "Maximum Subarray", topic: "Kadane's Algorithm", difficulty: "Medium" },
  { position: 113, number: 918, title: "Maximum Sum Circular Subarray", topic: "Kadane's Algorithm", difficulty: "Medium" },

  // Binary Search
  { position: 114, number: 35, title: "Search Insert Position", topic: "Binary Search", difficulty: "Easy" },
  { position: 115, number: 74, title: "Search a 2D Matrix", topic: "Binary Search", difficulty: "Medium" },
  { position: 116, number: 162, title: "Find Peak Element", topic: "Binary Search", difficulty: "Medium" },
  { position: 117, number: 33, title: "Search in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 118, number: 34, title: "Find First and Last Position of Element in Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 119, number: 153, title: "Find Minimum in Rotated Sorted Array", topic: "Binary Search", difficulty: "Medium" },
  { position: 120, number: 4, title: "Median of Two Sorted Arrays", topic: "Binary Search", difficulty: "Hard" },

  // Heap
  { position: 121, number: 215, title: "Kth Largest Element in an Array", topic: "Heap", difficulty: "Medium" },
  { position: 122, number: 502, title: "IPO", topic: "Heap", difficulty: "Hard" },
  { position: 123, number: 373, title: "Find K Pairs with Smallest Sums", topic: "Heap", difficulty: "Medium" },
  { position: 124, number: 295, title: "Find Median from Data Stream", topic: "Heap", difficulty: "Hard" },

  // Bit Manipulation
  { position: 125, number: 67, title: "Add Binary", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 126, number: 190, title: "Reverse Bits", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 127, number: 191, title: "Number of 1 Bits", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 128, number: 136, title: "Single Number", topic: "Bit Manipulation", difficulty: "Easy" },
  { position: 129, number: 137, title: "Single Number II", topic: "Bit Manipulation", difficulty: "Medium" },
  { position: 130, number: 201, title: "Bitwise AND of Numbers Range", topic: "Bit Manipulation", difficulty: "Medium" },

  // Math
  { position: 131, number: 9, title: "Palindrome Number", topic: "Math", difficulty: "Easy" },
  { position: 132, number: 66, title: "Plus One", topic: "Math", difficulty: "Easy" },
  { position: 133, number: 172, title: "Factorial Trailing Zeroes", topic: "Math", difficulty: "Medium" },
  { position: 134, number: 69, title: "Sqrt(x)", topic: "Math", difficulty: "Easy" },
  { position: 135, number: 50, title: "Pow(x, n)", topic: "Math", difficulty: "Medium" },
  { position: 136, number: 149, title: "Max Points on a Line", topic: "Math", difficulty: "Hard" },

  // 1D DP
  { position: 137, number: 70, title: "Climbing Stairs", topic: "1D DP", difficulty: "Easy" },
  { position: 138, number: 198, title: "House Robber", topic: "1D DP", difficulty: "Medium" },
  { position: 139, number: 139, title: "Word Break", topic: "1D DP", difficulty: "Medium" },
  { position: 140, number: 322, title: "Coin Change", topic: "1D DP", difficulty: "Medium" },
  { position: 141, number: 300, title: "Longest Increasing Subsequence", topic: "1D DP", difficulty: "Medium" },

  // Multidimensional DP
  { position: 142, number: 120, title: "Triangle", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 143, number: 64, title: "Minimum Path Sum", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 144, number: 63, title: "Unique Paths II", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 145, number: 5, title: "Longest Palindromic Substring", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 146, number: 97, title: "Interleaving String", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 147, number: 72, title: "Edit Distance", topic: "Multidimensional DP", difficulty: "Medium" },
  { position: 148, number: 123, title: "Best Time to Buy and Sell Stock III", topic: "Multidimensional DP", difficulty: "Hard" },
  { position: 149, number: 188, title: "Best Time to Buy and Sell Stock IV", topic: "Multidimensional DP", difficulty: "Hard" },
  { position: 150, number: 221, title: "Maximal Square", topic: "Multidimensional DP", difficulty: "Medium" },
];

// Matches the existing slugFromUrl convention in leetcode.ts — lowercase,
// parens stripped, any run of non-alphanumeric characters collapsed to one
// hyphen, no leading/trailing hyphens. Verified against every tricky title
// in this list (3Sum, Sqrt(x), Pow(x, n), N-Queens II, etc.) rather than
// hardcoding 150 slugs by hand.
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function leetcode150Url(item: Leetcode150Item): string {
  return `https://leetcode.com/problems/${slugify(item.title)}/`;
}
