<h1 align="center">Otter Azure tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

[![Stable Version](https://img.shields.io/npm/v/@o3r/azure-tools)](https://www.npmjs.com/package/@o3r/azure-tools)
[![Bundle Size](https://img.shields.io/bundlephobia/min/@o3r/azure-tools?color=green)](https://www.npmjs.com/package/@o3r/azure-tools)

This module provides a tool to comment a Pull Request on Azure.

## Comment Azure PR

### Usage

```shell
yarn dlx -p @o3r/azure-tools o3r-comment-pr <comment> [options]
```
or
```shell
npx -p @o3r/azure-tools o3r-comment-pr <comment> [options]
```

The required options include:
* the access token (`--accessToken <accessToken>`)
* the thread identifier (`--threadIdentifier <threadIdentifier>`)

Additionally, the following environment variables must be provided:
* `SYSTEM_TEAMPROJECT` (`System.TeamProject` in Azure)
* `BUILD_REPOSITORY_NAME` (`Build.Repository.Name` in Azure)
* `SYSTEM_PULLREQUEST_PULLREQUESTID` (must be a number) (`System.PullRequest.PullRequestId` in Azure)
* `SYSTEM_TEAMFOUNDATIONCOLLECTIONURI` (`System.TeamFoundationCollectionUri` in Azure)

#### Arguments

| Argument  | Description                        |
|-----------|------------------------------------|
| `comment` | Comment to publish on the Azure PR |

#### Options

| Option                                            | Alias | Value Type | Value Options                                                                                    | Default Value | Description                                                                                                      |
|---------------------------------------------------|:-----:|------------|--------------------------------------------------------------------------------------------------|---------------|------------------------------------------------------------------------------------------------------------------|
| `--accessToken <accessToken>` <br> **(Required)** | `-T`  | `string`   |                                                                                                  |               | Access token (Required)                                                                                          |
| `--commentStatus <commentStatus>`                 | `-s`  | `string`   | `Unknown` <br> `Active` <br> `Fixed` <br> `WontFix` <br> `Closed` <br> `ByDesign` <br> `Pending` | `Closed`      | Comment status                                                                                                   |
| `--mode <mode>`                                   | `-m`  | `string`   | `Replace` <br> `Add` <br> `Skip`                                                                 | `Add`         | Replaces thread if existing <br> Adds a comment to the existing thread <br> Do anything if thread already exists |
| `--threadIdentifier <threadIdentifier>`           | `-I`  | `string`   |                                                                                                  |               | Thread identifier                                                                                                |
| `--help`                                          | `-h`  |            |                                                                                                  |               | Output usage information                                                                                         |

### Example

```shell
yarn dlx -p @o3r/azure-tools o3r-comment-pr "[Deployed app]($(url))" -s Closed -I app-link -m Replace -T $(System.AccessToken)
```

or

```shell
npx -p @o3r/azure-tools o3r-comment-pr "[Deployed app]($(url))" -s Closed -I app-link -m Replace -T $(System.AccessToken)
```
