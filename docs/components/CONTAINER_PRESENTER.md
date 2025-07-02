# Container / Presenter

From a UI perspective it is a good practice to separate access of data/business logic form pure presentation. This allows developers to reuse presenters in other parts of the code with different data or having a container linked to multiple presenters, in case you want to display the same thing with a totally different user experience.

Some references:

* [Smart and dumb components](https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0)
* [The React + redux Container Pattern](http://www.thegreatcodeadventure.com/the-react-plus-redux-container-pattern/)
* [Smart Components vs Presentation Components](https://blog.angular-university.io/angular-2-smart-components-vs-presentation-components-whats-the-difference-when-to-use-each-and-why/)
* [Dumb Components and Visual Feedback in Angular Apps](https://teropa.info/blog/2016/02/22/dumb-components-and-visual-feedback-in-angular-apps.html)

## Implementation of the pattern

A component implementing the container/presenter pattern is split into two Angular components: the container and the presenter.

It should have a global `index.ts` module file.

### Container

The container is located in the __container__ folder of the component.

It must have a dedicated presenter component which will orchestrate the presentation.

It should follow the following naming convention:

| Attribute               | Pattern              |
| ----------------------- | -------------------- |
| **Component file name** | *-cont.component.ts  |
| **Selector name**       | *-cont               |
| **Component name**      | *ContComponent       |
| **Template file name**  | *-cont.template.html |
| **Unit test file name** | *-cont.spec.ts       |

It has its own _index.ts_ file exporting the component. Later, it could export the  customization files linked like `*-pres.config.ts`.

### Presenter

The presenter is located in the __presenter__ folder of the component.

It should follow the following naming convention:

| Attribute               | Pattern              |
| ----------------------- | -------------------- |
| **Component file name** | *-pres.component.ts  |
| **Selector name**       | *-pres               |
| **Component name**      | *PresComponent       |
| **Template file name**  | *-pres.template.html |
| **Style file name**     | *-pres.style.scss    |
| **Unit test file name** | *-pres.spec.ts       |

It has its own _index.ts_ file exporting the component. Later, it could export the  customization files linked like `*-pres.translation.ts` or `*-pres.config.ts`.

### Example

Example of a component implementing the container/presenter pattern:

```
passengers/
    container/
        [passengers-cont.module.ts]
        passengers-cont.component.ts
        passengers-cont.template.html
        passengers-cont.spec.ts
        index.ts
    contracts/
        passenger.model.ts
    presenter/
        [passengers-pres.module.ts]
        passengers-pres.component.ts
        passengers-pres.template.html
        passengers-pres.style.scss
        passengers-pres.spec.ts
        index.ts
    sub-components/
        my-sub-component/
    index.ts
```

## Guidelines summary

* A component interacting with external entities (store, services, etc.) may be split into a container and a presenter
* Subcomponents are located in the subcomponents folder of the related block. If the subcomponent is a block, it will then be set either in the component's root folder (if it has a functional meaning), or at the root of the functional folder in a dedicated subfolder.
* A component shared among different blocks and hosted in the same functional folder should be placed in a shared folder under the functional one.
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
        presenter/
        sub-components/
          my-sub-component/
      my-simple-component/
      shared/
        my-shared-component-in-my-complex-area/
          container/
          presenter/
    my-simple-area/
      container/
      presenter/
    shared/
      my-shared-component-in-app/
        container/
        presenter/
  elements/
    my-element/
```
