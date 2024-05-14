# Reduced Motion Setup
The ``@o3r/application`` module provides ``prefersReducedMotion()`` -- a helper that identifies the computer animation preferences.
This setup is generally used in the scope of accessibility as some users find it difficult to interact with pages with many animations.

To respect their choice, the application's Angular animations should follow the computer preferences.

This can be done in the BrowserAnimationsModule's configuration as follows:
```typescript
// Other imports
import {prefersReducedMotion} from '@o3r/application';

@NgModule({
  imports: [
    //...
    BrowserAnimationsModule.withConfig({
      disableAnimations: prefersReducedMotion()
    }),
    //...
    ]
})
export class AppModule {}
```

**Note:** Any new application that installs the ``@o3r/core`` via the ``ng add @o3r/core`` command will follow this recommendation.

**Note:** If you face timing issues in flaky e2e tests that might be linked to animation delays, you can force the reduced
motion browser setup in your test configuration.
Here is an example with a custom playwright configuration that will disable the Angular animations:
```typescript
const config: PlaywrightTestConfig = {
  timeout: 5000,
  projects: [{
    testDir: path.join(__dirname, 'my-path-to-my-spec-files'),
    testMatch: /.*e2e-spec-pattern.js$/,
    use: {browserName: 'chromium', contextOptions: {reducedMotion: 'reduce'}}
  }]
};

export default config;
```
