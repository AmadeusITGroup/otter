<p align="center">
  <img src="./.attachments/otter.png" alt="Super cute Otter!" width="30%" height="30%"/>
</p>

# Otter Library - How to contribute

Your contribution is essential to enhance the Otter repository. We want to keep it as easy as possible to provide bug fixes and whole new components that will enable you to build your web application.

We are always looking for contributions and will be happy to review your Pull Requests as long as those adhere to some basic rules.

## 1 - Getting started - Contribution handshake

Before starting writing a new component, the first thing to do is to contact [our fantastic support team][contact]. Indeed, you have to make sure the contribution you are about to start has not already been provided and that your intended component or bug fix will fit inside the repository. We can then help you assess any dependencies or impacts on any other components.
The last thing we want is to decline your pull request so please do not hesitate to contact us beforehand to agree on the entry criteria:

* the functional purpose/structure of the component (to avoid duplication of blocks)
* the technical architecture (to assure the homogeneity of the code)
* the Test Matrix for the component tests.

From a QA point of view, what will interest us here is the test matrix.
The QA members of the contributing team must provide the list of UI tests to be done at block level.
This test matrix is reviewed and validated by Otter Core QA.
The scope of these tests is:

* Functional validation on DOM
* Parameters
* Responsiveness
* Accessibility
* Localization
* Browsers
* Mobility

For the functional validation part, the tests must use/cover every actions possible to be done on the block and any data retrieval that may be used by e2e tests later on, to assure all required fixtures (component objects) are created and maintained through the component tests.

## 2 - Making changes

Please ensure that you are submitting quality code, specifically make sure that:

* The changes comply with our [code styling convention](#style-guide)
* The PR doesn't break the build, please check the CI build status after opening a PR and push corrective commits if anything goes wrong

  In addition to the component implementation, contributors must also follow:

* Component writing guidelines (TBD)

To help you with this, we are providing a set of:

* [Editors configuration](.editorconfig)
* [Linters configuration](./packages/@o3r/eslint-config-otter/README.md)
* [Component generator](./docs/core/OTTER_ANGULAR_TOOLS.md#schematics) (and more)

## 3 - Style guide

### General code aspects

Guideline | Comments
--- | ---
Always write description comments for methods and properties |
A description comment must use the pattern `/** [Your comment] */` |
Linter tasks must pass |
Tests must pass |
Unless exceptions, your changes should include / update unit tests. If you don't, you will need to justify if a reviewer asks for |
If your code is temporary, add a TODO or NOTE indicating when this should be reverted (link with a github issue or other tracking tool) |
New changes should be tested running a JIT build and AoT build |
Any change should be followed by changes in the generator whenever it's applicable |

### Typescript

Guideline | Comments
--- | ---
Properties should have the most restricted type possible | <code>// Wrong private type: string;</br>// Correct private type: "A" &verbar; "B";
</code>

## 4 - Submitting an Issue

Our purpose is to fix all the issues as soon as possible. In order to facilitate this we want to implement a standard process for bug opening.

Before you submit an issue, please make sure the issue is not already in our [issues backlog](https://github.com/AmadeusITGroup/otter/issues). Maybe an issue for your problem already exists and the discussion might inform you of workarounds
already available.

A minimal set of information will be required when an issue is opened:

* a description of the use case failing
* the version of library which is used
* 3rd-party libraries and their versions
* if possible a fix suggestion

If you already have a fix for the problem don't hesitate to open a pull request. Each pull request should be assign to an issue, so please create the issue (see process above) and link the PR to it.
For opening a PR see **Creating a pull request** section.

## 5 - Creating a pull request

You can open a pull request [here](https://github.com/AmadeusITGroup/otter/pulls).

### Commit message constraints

In order to have a nice change log generated, you will need to follow some guidelines :

* For bugfix : git commit -m "fix: this a commit message for a fix"
* For feature : git commit -m "feat: this a commit message for a feature"

Those are 2 common examples, for more information don't hesitate to have a look at <https://github.com/conventional-changelog/commitlint/#what-is-commitlint>

### Pull request specifics

Guideline | Comments
--- | ---
Your pull request description should not be empty |
For UI changes, description should contain a screenshot |

## 6 - Code review Process

You will be contacted back with some feedback, improvements to do and the process will continue until the pull request is ready to be merged.

Here is a list of rules for a nice reviewer:

Guideline | Comments
--- | ---
`Needs work` tag **must** be followed by, at least, 1 comment with change required. A question is not a change requirement | This tag is saying "I am voting to not merge your PR until you send, at least, one commit to fix the points I have raised"
`Approved` **may** be followed by change requests | This tag is saying "I am voting to merge this PR, but you may consider change those small points if you wish"
Comments are always targeted to issues in the code, and never criticize the author |
Comments purpose is to change/improve code |
Comments can be made:<ul><li>to address functional issues</li><li>to increase readability and maintainability of the code</li><li>to ensure common and agreed design and architecture principles</li><li>to increase the code performance or reduce CPU consumption</li></ul> |
Comments must be constructive, suggesting how to improve things |
A comment can be a question in case the reviewer asks for deeper understanding of the code without really targeting a change. A question is not a change requirement, so you should not use the `Needs work` tag |

Thanks in advance for your contribution, and we look forward to hearing from you :)
