# Container / Presenter

We encourage developers to decouple components into containers and presenters. From a UI perspective it is a good practice to separate access of Data/ business logic form pure presentation, this allows developer to reuse presenters in other parts of the code with different data or having a container linked to multiple presenters, in case you want to display the same thing with a totally different user experience.

Some references:

* [Smart and dumb components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
* [The React + redux Container Pattern](http://www.thegreatcodeadventure.com/the-react-plus-redux-container-pattern/)
* [Smart Components vs Presentation Components](https://blog.angular-university.io/angular-2-smart-components-vs-presentation-components-whats-the-difference-when-to-use-each-and-why/)
* [Dumb Components and Visual Feedback in Angular Apps](https://teropa.info/blog/2016/02/22/dumb-components-and-visual-feedback-in-angular-apps.html)

## Implementation of the pattern

A component implementing the container/presenter pattern is split into two Angular components: the container and the presenter.

It should have a global _index.ts_ module file.

### Container

The container is located in the _container_ folder of the component.

It must implement the template outlet pattern in order to get the ability to customise the presentation layer.

It must have a dedicated presenter component which will orchestrate the presentation.

It should follow the following naming convention:

| Attribute        | Pattern           |
| ------------- |:-------------|
| **Component file name**      | *-cont.component.ts |
| **Selector name**      | *-cont |
| **Component name**      | *ContComponent |
| **Configuration file name**      | *-cont.config.ts |
| **Configuration name**      | *ContConfig |
| **Context file name**      | *-cont.context.ts |
| **Context interface names**      | *ContContextInput / *ContContextOutput / *ContContext |
| **Fixture file name**      | *-cont.fixture.ts |
| **Fixture name**      | 	*ContFixture |
| **Module file name**      | *-cont.module.ts |
| **Module name**      | *ContModule |
| **Template file name**      | *-cont.template.html |
| **Unit test file name**      | *-cont.spec.ts |

It has its own _index.ts_ file exporting:

* Module file
* Context file
* Configuration file

### Presenter

The presenter is located in the _presenter_ folder of the component.

It should follow the following naming convention:

| Attribute        | Pattern           |
| ------------- |:-------------|
| **Component file name**      | *-pres.component.ts |
| **Selector name**      | *-pres |
| **Component name**      | *PresComponent |
| **Configuration file name**      | *-pres.config.ts |
| **Configuration name**      | *PresConfig |
| **Context file name**      | *-pres.context.ts |
| **Context interface names**      | *PresContextInput / *PresContextOutput / *PresContext |
| **Fixture file name**      | *-pres.fixture.ts |
| **Fixture name**      | 	*PresFixture |
| **Module file name**      | *-pres.module.ts |
| **Module name**      | *PresModule |
| **Template file name**      | *-pres.template.html |
| **Style file name**      | *-pres.style.scss |
| **Unit test file name**      | *-pres.spec.ts |

It has its own _index.ts_ file exporting:

* Module file
* Context file
* Configuration file

### Example

Example of a component implementing the container/presenter pattern:

```
passengers/
    container/
        passengers-cont.component.ts
        passengers-cont.module.ts
        passengers-cont.template.html
        passengers-cont.config.ts
        passengers-cont.context.ts
        passengers-cont.spec.ts
        index.ts
    contracts/
        passenger.model.ts
    directives/
        my-directive.directive.ts
    presenter/
        passengers-pres.component.ts
        passengers-pres.module.ts
        passengers-pres.template.html
        passengers-pres.style.scss
        passengers-pres.style.theme.scss
        passengers-pres.config.ts
        passengers-pres.context.ts
        passengers-pres.fixture.ts
        passengers-pres.spec.ts
        index.ts
    sub-components/
        my-sub-component/
    index.ts
```

## Guidelines summary

* A component interacting with external entities (store, services, etc.) should be split into a container and a presenter
* A component with no interactions with external entities should only be a presenter
* By definition, a block is always split into container/presenter
* Subcomponents are located in the related block subcomponents folder. If the subcomponent is a block, it will then be set either in the components root folder (if it has a functional meaning), or at the root of the functional folder in a dedicated sub folder.
* A component shared among different blocks and hosted in the same functional folder, should be placed in a shared folder under the functional one.
* Avoid creating useless intermediate folder:
    * A component with only a presenter and no container should not have a presenter folder
    * A functional area containing only one block should not have a sub-folder for it

## Global directory structure overview

```
app/src/
    components/
        my-complex-area/
            my-complex-component/              
                container/
                contracts/
                directives/
                presenter/
                sub-components/
                    my-sub-component/
                        container/
                        presenter/
            my-simple-component/
            shared/
                my-shared-component-in-area/
                    container/
                    presenter/
        my-simple-area/
            container/
            presenter/
        shared/
            my-shared-component-in-lib/
                container/
                presenter/
    elements/
        my-element/
```
