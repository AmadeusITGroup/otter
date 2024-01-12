<h1 align="center">Otter Azure tools</h1>
<p align="center">
  <img src="https://raw.githubusercontent.com/AmadeusITGroup/otter/main/assets/logo/otter.png" alt="Super cute Otter!" width="40%"/>
</p>

## Description

Various Azure DevOps tools

## Comment Azure PR

### Usage

```shell
yarn dlx -p @o3r/azure-tools o3r-comment-pr "[Deployed app]($(url))" -s Closed -I app-link -m Replace -T $(System.AccessToken)
```

or

```shell
npx -p @o3r/azure-tools o3r-comment-pr "[Deployed app]($(url))" -s Closed -I app-link -m Replace -T $(System.AccessToken)
```

### Options available

```shell
yarn dlx -p @o3r/azure-tools o3r-comment-pr --help
```

or

```shell
npx -p @o3r/azure-tools o3r-comment-pr --help
```
