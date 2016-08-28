[![Build Status](https://travis-ci.org/agiantwhale/dynamic-optimize.svg?branch=master)](https://travis-ci.org/agiantwhale/dynamic-optimize)

PRE-ALPHA-ALPHA-ALPHA-ALPHA :smiling_imp:

Couple of months ago I worked on a calorie optimizer for [Michigan's dining hall menu](https://jae.works/mfat/). Since everything on the site ran on the browser and since optimizing the menu was a dynamic programming problem, I ran into a couple of challenges:

1. There isn't a general purpose dynamic programming JS library that you can just drop in & use.
2. Call-stack limits are different for each browser - for example, Chrome had a much larger stack size than Firefox.
3. No standard library exists for general purpose function memoization - UnderscoreJS provides a function but it's memoization only depends on one parameter, which is not good.
4. Ability to quickly add/remove optimization parameters mid-processing / each step.

Anyways, it turns out that I need a good DP algo for some of my current projects, so I thought I should refactor and extract it to a dedicated library. While implementing the DP algo, I've thought of some clever solutions to some of these problems.

1. Custom general purpose DP library where you can feed in search/sort functions, fallback to underscore's binary search & quick sort
2. Creates only ONE copy of provided optimization sample (Feel free to pass in giant arrays)
3. Memoization uses inversion of control patterns to expose step to callee
4. Uses MATLAB's Szudzik pairing as it's hashing logic to support arbitrary N-number of parameters
5. Battled & unit tested, with > 90% coverage
