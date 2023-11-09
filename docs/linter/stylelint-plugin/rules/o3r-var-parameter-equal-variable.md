# o3r-var-parameter-equal-variable

Check that the first parameter of o3r-var is equal to the variable name.

Example:
```scss
@use '@o3r/styling' as o3r;
$my-margin: o3r.variable('my-margin', 1px);
```

The `fix` option can automatically fix all the problems reported by this rule.

## Options

No options available yet.

## Examples

The following patterns are considered problems:

```scss
@use '@o3r/styling' as o3r;
$my-margin: o3r.variable('my-margin-bottom', 1px);
```

```scss
@use '@o3r/styling' as o3r;
$my-margin: o3r.variable('$my-margin', 1px);
```

The following patterns are not considered problems:

```scss
@use '@o3r/styling' as o3r;
$my-margin: o3r.variable('my-margin', 1px);
```
