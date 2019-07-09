# About Dev Challenge

Dev Challenge is developer reward program for Dev Repository Token.

Distribute Dev tokens as rewards for pull requests merged between July 1, 2019, and December 19, 2019.

💡 You can send pull-requests for this document; this document may changes.

## Translations

[日本語](https://github.com/dev-protocol/repository-token/blob/master/docs/DEV_CHALLENGE.JA.md)

## Rules

Here are the Dev Challenge rules:

1. Applies to pull requests merged between July 1, 2019, and December 19, 2019.
1. The reward is [Dev token](https://etherscan.io/token/0x98626e2c9231f03504273d55f397409defd4a093).
1. Set the severity points for each pull requests. The severity points are determined by your self-assessment and agreement with the assessment by this project owner. Its detail is described in the section of Severity.
1. In the case of a pull request that fixes a known issue, if the issue is reported by others who have already entered, then divide severity points the issue reporter and resolver. Its ratio is described in the section of Severity.
1. The reward is 3 DEV for severity points 1.
1. Send rewards on the 20th of every month.
1. The rewards are the cumulative severity points of pull requests merged from the 19th of this month to the 20th of the last month multiplied by the DEV rate.
1. As soon as the distribution of 111,690 DEV is completed, Dev Challenge ends.
1. In any case, Dev Challenge ends on December 20, 2019.

## Severity

| Severity | Points | e.g.                                                                                              |
| -------- | ------ | ------------------------------------------------------------------------------------------------- |
| Critical | 100    | Update token model, Update the core of this software.                                             |
| High     | 50     | Fix vulnerability, Make the Developer Rewards Program better, etc.; Fix or Kaizen unknown issues. |
| Medium   | 20     | Add implementation, Fix test, Refactoring, etc.; Fix to follow whitepaper.                        |
| Low      | 4      | Empty test, Rename variable, etc.; Fix without implementation.                                    |
| Note     | 1      | Typo, Sentence mistakes, etc.; Fix not related to software.                                       |

When you fix an issue reported by others, severity points are divided by the following ratio:

| Reporter | Resolver |
| -------- | -------- |
| 20%      | 80%      |
