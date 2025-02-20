# Visual testing reporter

When e2e visual testing fail, screenshots have to be updated.
To facilitate the update of the screenshots directly from the CI,
we have created a GitHub action [AmadeusITGroup/otter/tools /github-actions/create-branch-e2e-screenshots](tools/github-actions/create-branch-e2e-screenshots/readme.md) to create a commit on the branch with updated screenshots if the visual tests have failed.
To do so, we have created a [Playwright reporter](https://playwright.dev/docs/test-reporters) to retrieve the actual and expected screenshots paths when using [`toHaveScreenshot`](https://playwright.dev/docs/api/class-pageassertions#page-assertions-to-have-screenshot-1)

## Usage

** Prerequisite **
- Install `@o3r/testing` as a dev-dependency.

Update the `reporter` in your Playwright configuration.
```typescript
export default defineConfig({
  reporter: [
    // ...
    ['@o3r/testing/visual-testing-reporter']
  ]
});
```

In case you use Yarn PnP, you have to resolve the path to the reporter.
```typescript
export default defineConfig({
  reporter: [
    // ...
    [require.resolve('@o3r/testing/visual-testing-reporter')]
  ]
});
```

You can specify the `outputFile`, the default value is `playwright-reports/visual-testing/report.json`.
```typescript
export default defineConfig({
  reporter: [
    [require.resolve('@o3r/testing/visual-testing-reporter'), { outputFile: 'visual-testing-report.json' }]
  ]
});
```

## Limitations

The reporter will only contain the screenshots for the failed `toHaveScreenshot` evaluations.
If you chain several ones, don't forget to use [`expect.soft()`](https://playwright.dev/docs/test-assertions#soft-assertions).

> [WARNING]
> If you use [`test.step()`](https://playwright.dev/docs/api/class-test#test-step), it will stop the test execution as soon as one step is marked as failed, even if you use `expect.soft()`.
