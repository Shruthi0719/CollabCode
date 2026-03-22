// client/src/data/problems.js
// Add more problems by following the same structure

export const PROBLEMS = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3,2,4], target = 6',      output: '[1,2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
    ],
    constraints: ['2 ≤ nums.length ≤ 10⁴', '-10⁹ ≤ nums[i] ≤ 10⁹', 'Only one valid answer exists'],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Your solution here
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]`,
      python3: `def two_sum(nums, target):
    # Your solution here
    pass

print(two_sum([2, 7, 11, 15], 9))  # [0, 1]`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your solution here
        return new int[]{};
    }

    public static void main(String[] args) {
        Solution s = new Solution();
        int[] result = s.twoSum(new int[]{2, 7, 11, 15}, 9);
        System.out.println(result[0] + ", " + result[1]); // 0, 1
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Your solution here
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    auto result = twoSum(nums, 9);
    cout << result[0] << ", " << result[1] << endl; // 0, 1
}`,
    },
  },
  {
    id: 'palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.

Given a string s, return true if it is a palindrome, or false otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true',  explanation: '"amanaplanacanalpanama" is a palindrome' },
      { input: 's = "race a car"',                      output: 'false', explanation: '"raceacar" is not a palindrome' },
    ],
    constraints: ['1 ≤ s.length ≤ 2 × 10⁵', 's consists only of printable ASCII characters'],
    starterCode: {
      javascript: `function isPalindrome(s) {
  // Your solution here
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true
console.log(isPalindrome("race a car")); // false`,
      python3: `def is_palindrome(s):
    # Your solution here
    pass

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))  # False`,
      java: `class Solution {
    public boolean isPalindrome(String s) {
        // Your solution here
        return false;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isPalindrome("A man, a plan, a canal: Panama")); // true
    }
}`,
      cpp: `#include <iostream>
#include <string>
using namespace std;

bool isPalindrome(string s) {
    // Your solution here
    return false;
}

int main() {
    cout << isPalindrome("A man, a plan, a canal: Panama") << endl; // 1
}`,
    },
  },
  {
    id: 'fizzbuzz',
    title: 'FizzBuzz',
    difficulty: 'Easy',
    description: `Given an integer n, return a string array where:
• answer[i] == "FizzBuzz" if i is divisible by 3 and 5
• answer[i] == "Fizz" if i is divisible by 3
• answer[i] == "Buzz" if i is divisible by 5
• answer[i] == i (as a string) otherwise`,
    examples: [
      { input: 'n = 3',  output: '["1","2","Fizz"]' },
      { input: 'n = 15', output: '["1","2","Fizz","4","Buzz","Fizz","7","8","Fizz","Buzz","11","Fizz","13","14","FizzBuzz"]' },
    ],
    constraints: ['1 ≤ n ≤ 10⁴'],
    starterCode: {
      javascript: `function fizzBuzz(n) {
  // Your solution here
}

console.log(fizzBuzz(15));`,
      python3: `def fizz_buzz(n):
    # Your solution here
    pass

print(fizz_buzz(15))`,
      java: `import java.util.*;

class Solution {
    public List<String> fizzBuzz(int n) {
        // Your solution here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        System.out.println(new Solution().fizzBuzz(15));
    }
}`,
      cpp: `#include <iostream>
#include <vector>
#include <string>
using namespace std;

vector<string> fizzBuzz(int n) {
    // Your solution here
    return {};
}

int main() {
    for (auto& s : fizzBuzz(15)) cout << s << " ";
}`,
    },
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    description: `Write a function that reverses a string. The input is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]' },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]' },
    ],
    constraints: ['1 ≤ s.length ≤ 10⁵', 's[i] is a printable ASCII character'],
    starterCode: {
      javascript: `function reverseString(s) {
  // Modify s in-place, return nothing
}

const s = ["h","e","l","l","o"];
reverseString(s);
console.log(s); // ["o","l","l","e","h"]`,
      python3: `def reverse_string(s):
    # Modify s in-place
    pass

s = ["h","e","l","l","o"]
reverse_string(s)
print(s)  # ['o', 'l', 'l', 'e', 'h']`,
      java: `class Solution {
    public void reverseString(char[] s) {
        // Your solution here
    }

    public static void main(String[] args) {
        char[] s = {'h','e','l','l','o'};
        new Solution().reverseString(s);
        System.out.println(new String(s)); // olleh
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

void reverseString(vector<char>& s) {
    // Your solution here
}

int main() {
    vector<char> s = {'h','e','l','l','o'};
    reverseString(s);
    for (char c : s) cout << c;
}`,
    },
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray',
    difficulty: 'Medium',
    description: `Given an integer array nums, find the subarray with the largest sum and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6' },
      { input: 'nums = [5,4,-1,7,8]',             output: '23', explanation: 'Subarray [5,4,-1,7,8] has the largest sum = 23' },
    ],
    constraints: ['1 ≤ nums.length ≤ 10⁵', '-10⁴ ≤ nums[i] ≤ 10⁴'],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Your solution here (try Kadane's algorithm)
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6`,
      python3: `def max_sub_array(nums):
    # Your solution here (try Kadane's algorithm)
    pass

print(max_sub_array([-2,1,-3,4,-1,2,1,-5,4]))  # 6`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        // Your solution here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(new Solution().maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4})); // 6
    }
}`,
      cpp: `#include <iostream>
#include <vector>
using namespace std;

int maxSubArray(vector<int>& nums) {
    // Your solution here
    return 0;
}

int main() {
    vector<int> nums = {-2,1,-3,4,-1,2,1,-5,4};
    cout << maxSubArray(nums) << endl; // 6
}`,
    },
  },
];
