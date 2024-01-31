# Composition and Inheritance
This page refers to the [OpenApi Inheritance feature](https://swagger.io/docs/specification/data-models/inheritance-and-polymorphism/)
and the [allOf, oneOf schemes](https://swagger.io/docs/specification/data-models/oneof-anyof-allof-not/).

AllOf schema are supported by the generator and will be treated as inheritance or composition depending on the presence of a discriminator property.

## Composition
An "allOf" schema without a discriminator will be considered as a composition of other models without any hierarchy link.
This means all the properties of each model will be copied into the model without any reference to the models it is 
composed of.

For example, the following model
```yaml
components:
  schemas:
    BasicErrorModel:
      type: object
      required:
        - message
        - code
      properties:
        message:
          type: string
        code:
          type: integer
    ExtendedErrorModel:
      allOf:     # Combines the BasicErrorModel and the inline model
        - $ref: '#/components/schemas/BasicErrorModel'
        - type: object
          required:
            - rootCause
          properties:
            rootCause:
              type: string
```
will generate two models:
- BasicErrorModel
```typescript
export interface BasicErrorModel {
  message: string;
  code: number;
}
```
- ExtendedErrorModel
```typescript
export interface ExtendedErrorModel {
  message: string;
  code: number;
  rootCause: string;
}
```

## Inheritance:

The addition of a discriminator allows a hierarchy between the models and the possibility to identify which child class
a model can be casted into.
For example, let's consider a Pet object and its two class child Cat and Dog:
```yaml
components:
  schemas:
    Pet:
      type: object
      required:
        - pet_type
      properties:
        pet_type:
          type: string
      discriminator:
        propertyName: petType
    Dog:     # "Dog" is a value for the pet_type property (the discriminator value)
      allOf: # Combines the main `Pet` schema with `Dog`-specific properties
        - $ref: '#/components/schemas/Pet'
        - type: object
          # all other properties specific to a `Dog`
          properties:
            bark:
              type: boolean
            breed:
              type: string
              enum: [Dingo, Husky, Retriever, Shepherd]
    Cat:     # "Cat" is a value for the pet_type property (the discriminator value)
      allOf: # Combines the main `Pet` schema with `Cat`-specific properties
        - $ref: '#/components/schemas/Pet'
        - type: object
          # all other properties specific to a `Cat`
          properties:
            hunts:
              type: boolean
            age:
              type: integer
```

A Pet can be cast into a Cat or a Dog depending the petType value. In this case, there will be a hierarchy between Pet
and Cat/Dog:

```typescript
export interface Pet {
  petType: PetTypeEnum;
}

export interface Cat extends Pet {
  hunts: boolean;
  age: number;
}

export interface Dog extends Pet {
  bark: boolean;
  bread: BreedEnum;
}

export type BreedEnum = 'Dingo' | 'Husky' | 'Retriever' | 'Sheperd';
export type PetTypeEnum = 'Cat' | 'Dog';
```

This will mainly impact the revival of the Pet model.
For the Cat and Dog models, this is pretty straightforward as we know each of these models.
It is a bit more tricky to revive the parent model.

In this case, the SDK will try to rely on the discriminator's value and try to map one of the child models. If it fails,
it will try to revive its own properties.
```typescript
export function revivePet<T extends Pet = Pet>(data: any): undefined | T | Cat | Dog {
  if (!data) {return;}
  if (data.petType) {
    if (data.petType[0].toUpperCase() + data.petType.slice(1) === 'Cat') {
      return reviveCat(data);
    }
    if (data.petType[0].toUpperCase() + data.petType.slice(1) === 'Dog') {
      return reviveDog(data)
    }
  }
  return data as T;
}
```

> **Note**: The discriminator needs to be of enum type as the string format would be too generic to map the accepted 
> value to the supported models.

## Union Type
The oneOf schema is also supported and is handled as an union type.

Instead of considering a generic Pet model and its two children Cat and Dog, let's consider instead that a Pet can be 
either a Cat or a Dog.

This time, the specification will be as follows:

```yaml
components:
  schemas:
    Pet:
      oneOf:
        - $ref: '#/components/schemas/Cat'
        - $ref: '#/components/schemas/Dog'
      discriminator:
        propertyName: petType

    Dog:     # "Dog" is a value for the pet_type property (the discriminator value)
      - type: object
        required:
        - petType
        properties:
          petType:
            type: string
            enum: [Cat, Dog]
        # all other properties specific to a `Dog`
          bark:
            type: boolean
          breed:
            type: string
            enum: [Dingo, Husky, Retriever, Shepherd]
    Cat:     # "Cat" is a value for the pet_type property (the discriminator value)
      - type: object
        required:
        - petType
        properties:
          petType:
            type: string
            enum: [Cat, Dog]
           # all other properties specific to a `Cat`
          properties:
            hunts:
              type: boolean
            age:
              type: integer
```

For this use case, the relation between Pet, Cat and Dog will be a union.

Hence the generated code will be as follows:
```typescript
export interface Cat {
  petType: PetTypeEnum;
  hunts: boolean;
  age: number;
}

export interface Dog {
  petType: PetTypeEnum;
  bark: boolean;
  bread: BreedEnum;
}

export type BreedEnum = 'Dingo' | 'Husky' | 'Retriever' | 'Sheperd';

export type PetTypeEnum = 'Cat' | 'Dog';
export type Pet = Cat | Dog;
```
The revival of the Pet is handled the same way as the problem is the same: a discriminator is needed to ensure which 
model to revive.

>**Note** Just as the inheritance, for a proper revival of the object, the discriminator shall be an enum.

### Non supported schema type
As of today, the Typescript generator does not support the anyOf and the not schema.
