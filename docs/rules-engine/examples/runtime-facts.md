# Rules Engine Example - Runtime Facts

## Introduction

In this example, we manage a Ruleset with complex conditions that will be reused in different rules.
Let's check the following use case:
A world-wide event organizes conferences in Paris, London and New-York. To promote the event for young people, there is an
extra discount for minors if they attend two days of the event. 

While the pricing logic will be done on the API side, we will display a dedicated message for kids booking two days of the
conference.

The French and American conferences also offer extra activities for the minors attending the event and will display a teaser of the
activities.

In this scenario, we consider the following facts:
* `ageOfCustomer` at the time of the event
* `locationOfConference` the customer wishes to attend
* `daysSpentAtEvent`

The majority of the customer will depend on the place of the conference and the date of birth of the customer:
* Paris: 18
* New-York: 21

You could write this rule as follows:
* If a customer is under 18 and the event is in London or in Paris, or if they are under 21 and the event is in New-York,
then if they spend 2 days at the event, a promotion text will be displayed
* If a customer is under 18 and the event is in Paris, or if they are under 21 and the event is in New-York, then a teaser
for extra activities will be displayed.

In this Ruleset, there is some duplication of "the customer is a minor" logic. This makes it more difficult to
read and maintain.

Let's see how the use of an intermediate, temporary fact (also known as runtime fact) helps to refactor this kind of 
ruleset.

For this rule, we will simply introduce the `IS_MINOR` fact and share the logic between the different rules.
There will be three simpler rules and each will handle one condition with no duplicate logic:
* Is the customer a minor?
* Is the minor attending the French or American conference? If so, an activity teaser will be shown. 
* Is the minor staying two days? If so, a promotion text is displayed.

## Ruleset

```json5
{
  "schema": "https://raw.githubusercontent.com/AmadeusITGroup/otter/main/packages/%40o3r/rules-engine/schemas/rulesets.schema.json",
  "rulesets": [
    {
      "id": "6194b61a-1bf3-4c02-8b7c-20f782d68324",
      "name": "Promotion for minors",
      "disabled": false,
      "rules": [
        {
          "id": "5467e501-b9ff-414f-8026-56885d0d7a4b",
          "name": "Check if customer is a minor",
          "disabled": false,
          "outputRuntimeFacts": [
            "IS_MINOR"
          ],
          "inputRuntimeFacts": [],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "any": [
                // The customer is a minor in France or London
                {
                  "all": [
                    {
                      "lhs": {
                        "type": "FACT",
                        "value": "ageOfCustomer"
                      },
                      "operator": "lessThan",
                      "rhs": {
                        "type": "LITERAL",
                        "value": 18
                      }
                    },
                    {
                      "lhs": {
                        "type": "FACT",
                        "value": "locationOfConference"
                      },
                      "operator": "inArray",
                      "rhs": {
                        "type": "LITERAL",
                        "value": [
                          "Paris",
                          "London"
                        ]
                      }
                    }
                  ]
                },
                // The customer is a minor in New-York
                {
                  "all": [
                    {
                      "lhs": {
                        "type": "FACT",
                        "value": "ageOfCustomer"
                      },
                      "operator": "lessThan",
                      "rhs": {
                        "type": "LITERAL",
                        "value": 21
                      }
                    },
                    {
                      "lhs": {
                        "type": "FACT",
                        "value": "locationOfConference"
                      },
                      "operator": "equals",
                      "rhs": {
                        "type": "LITERAL",
                        "value": "New-York"
                      }
                    }
                  ]
                }
              ]
            },
            "successElements": [
              {
                "actionType": "SET_FACT",
                "key": "IS_MINOR",
                "value": "TRUE"
              }
            ],
            "failureElements": [
              {
                "actionType": "SET_FACT",
                "key": "IS_MINOR",
                "value": "FALSE"
              }
            ]
          }
        },
        {
          "id": "5467e501-b9ff-414f-8026-56885d0d7aas",
          "name": "Teaser for minors in Paris and in New-York",
          "disabled": false,
          "outputRuntimeFacts": [],
          "inputRuntimeFacts": [
            "IS_MINOR"
          ],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "all": [
                {
                  "lhs": {
                    "type": "RUNTIME_FACT",
                    "value": "IS_MINOR"
                  },
                  "operator": "equals",
                  "rhs": {
                    "type": "LITERAL",
                    "value": "TRUE"
                  }
                },
                {
                  "lhs": {
                    "type": "FACT",
                    "value": "locationOfConference"
                  },
                  "operator": "inArray",
                  "rhs": {
                    "type": "LITERAL",
                    "value": [
                      "Paris",
                      "New-York"
                    ]
                  }
                },
              ],
            },
            "successElements": [
              {
                "actionType": "UPDATE_PLACEHOLDER",
                "key": "teaser-placeholder",
                "value": "assets/placeholders/teaser-activities.json"
              }
            ]
          }
        },
        {
          "id": "5467e501-b9ff-414f-8026-56885d0d7aas",
          "name": "Discount message for minors spending 2 days at the event ",
          "disabled": false,
          "outputRuntimeFacts": [],
          "inputRuntimeFacts": [
            "IS_MINOR"
          ],
          "rootElement": {
            "elementType": "RULE_BLOCK",
            "blockType": "IF_ELSE",
            "condition": {
              "all": [
                {
                  "lhs": {
                    "type": "RUNTIME_FACT",
                    "value": "IS_MINOR"
                  },
                  "operator": "equals",
                  "rhs": {
                    "type": "LITERAL",
                    "value": "TRUE"
                  }
                },
                {
                  "lhs": {
                    "type": "FACT",
                    "value": "daysSpentAtEvent"
                  },
                  "operator": "equals",
                  "rhs": {
                    "type": "LITERAL",
                    "value": 2
                  }
                }
              ]
            },
            "successElements": [
              {
                "actionType": "UPDATE_LOCALISATION",
                "key": "welcome-text",
                "value": "welcome-text-with-promotion"
              }
            ]
          }
        }
      ]
    }
  ]
}
```
