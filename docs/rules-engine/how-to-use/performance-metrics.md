# Rules engine - Performance metrics

## Available metrics

The Otter rules engine provides a number of metrics to evaluate the performance of your rules:

- **Rule evaluation start mark**: The time when the rule engine started evaluating the rules.
- **Rule evaluation end mark**: The time when the rule engine finished evaluating the rules.
- **Rule evaluation duration measurement**: The time it took to evaluate the rules.

The marks names are formatted as following:

```
<rule-engine-name>:<ruleset-name>:<rule-name>:start
<rule-engine-name>:<ruleset-name>:<rule-name>:end
```

> [!NOTE]
> The `<rule engine name>` is the name of the rules engine instance. Its default value is `rules-engine`.
> This can be overridden via the `rulesEngineInstanceName` option during the rules engine's instantiation.

## Performance reporting API configuration

### Browser application

If the rules engine is running in a browser, the performance metrics can be analyzed via the built-in [Performance API](https://developer.mozilla.org/en-US/docs/Web/API/Performance_API).

### Node application

If the rules engine is running in a Node, there is no default performance reporting mechanism.

The reporting of the performance metrics can be configured via the rules engine `performance` option.
The following example shows how to configure the reporting of the performance metrics in a Node application context:

```typescript
import { RulesEngine, EngineDebugger } from '@o3r/rules-engine';
import { performance } from 'node:perf_hooks';

const engine = new RuleEngine({ performance });
```
