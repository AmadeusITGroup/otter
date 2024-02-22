# Telemetry

You can help the Otter Team to prioritize features and improvements by permitting the Otter team to send command-line command usage statistics to Amadeus. The Otter Team does not collect usage statistics unless you explicitly opt in.

## What is collected?

Usage analytics may include the following information:
- Your operating system (macOS, Linux distribution, Windows) and its version.
- Package manager name and version (local version only).
- Node.js version (local version only).
- Otter version (local version only).
- Command name that was run.
- The time it took to run.
- Project name.
- The schematic/builder options.

> [!WARNING]
> We don't use it, but your IP address will also be stored for one month for security reasons.

## How to disable telemetry?

To disable it for:
- your project, set `config.o3rMetrics` to false in your `package.json`.
- your machine, set `O3R_METRICS` to false in your environment variables.
- a builder/schematic run, run it with `--no-o3r-metrics`
