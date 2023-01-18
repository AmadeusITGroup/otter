# Naming convention
Naming convention is here to help you set your variable names in a common manner in order to keep code coherence and 
readability

## File names

File names must be written in Kebab case

Depending on container or presenter context, your file names should be suffixed with ``` -cont ``` or ``` -pres ```
.<br />
More details are available in [Component structure documentation](./COMPONENT_STRUCTURE.md)

You will find below the patterns to be followed for file names in the different context:
* component: ``` ${name}.component.ts ```
* configuration: ``` ${name}.config.ts ```
* context: ``` ${name}.context.ts ```
* fixture: ``` ${name}.fixture.ts ```
* integration test: ``` ${name}.int-spec.ts ```
* module: ``` ${name}.module.ts ```
* template: ``` ${name}.template.html ```
* barrel: ``` index.ts ```
* style: ``` ${name}.style.scss ```
* theme: ``` ${name}.style.theme.scss ```
* readme: ``` README.md ```
* unit test: ``` ${name}.spec.ts ```

## Class names

Class names must be written in Pascal case.

You will find below the patterns to be followed for components class names in the different context:
* container: ``` ${name}ContComponent ```
* presenter: ``` ${name}PresComponent ```
* configuration: ``` ${name}(Cont | Pres)Config ```
* context: ``` ${name}(Cont | Pres)ContextInput ```  ``` ${name}(Cont | Pres)ContextOuput ```  ``` ${name}(Cont | Pres)
Context ```
* fixture: ``` ${name}(Cont | Pres)Fixture ```
* module: ``` ${name}(Cont | Pres)Module ```

## Variable names

Variable names must be written in Camel case.

You will find below the patterns to be followed for variable names in the different context:
* For templateRef:  ``` ${targeted component class name without Component suffix}(Cont | Pres)Template  ```
* For config:  ``` ${targeted component class name without Component suffix}(Cont | Pres)Config  ```
