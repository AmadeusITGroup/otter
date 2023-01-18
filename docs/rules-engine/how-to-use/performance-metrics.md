# Performance metrics

The Rules Engine provides a number of performance metrics that can be used to evaluate the performance of your rules.
Currently, the following metrics are available:

- **Rule evaluation start mark**: The time when the rule engine starts evaluating the rules.
- **Rule evaluation end mark**: The time when the rule engine finished evaluating the rules.
- **Rule evaluation duration measurement**: The time it took to evaluate the rules.

The marks names are formatted as following:

```
<rule-engine-name>:<ruleset-name>:<rule-name>:start
<rule-engine-name>:<ruleset-name>:<rule-name>:end
```

> **Note:** The `<rule engine name>` is the name of the rules engine instance, the default value is `rules-engine` and can be overridden in the instantiation of the rules engine via the *rulesEngineInstanceName* option.

## Performance reporting API configuration

By default, if the rules engine is running in a browser, the performance metrics are reported via the [Performance TImeline API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_Timeline). If the rules engine is running in a Node, there is no default performance reporting mechanism.

The reporting of the performance metrics can be configured via the a rules engine `performance` option.
The following example shows how to configure the reporting of the performance metrics in a Node application context :

```typescript
import { RulesEngine, EngineDebugger } from '@o3r/rules-engine';
import { performance } from 'node:perf_hooks';

const engine = new RuleEngine({ performance });
```
