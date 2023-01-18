# Update otter schematics - tips


## Where to define the ng-update migrations?

To be recognized by the __ng-cli as update schematics__, we have to define our migrations schematics in 
__package.json__, _ng-update_ section of the package which contains the updates, in our case __@o3r/core__
```json
"ng-update": {
    "migrations": "./migration.json"
}
```

The content of migration.json is as follows:  
ex:
```json
{
  "$schema": "https://raw.githubusercontent.com/angular/angular-cli/master/packages/angular_devkit/schematics/collection-schema.json",
  "schematics": {
    "migration-v3": {
      "version": "3.1.0-alpha.0", // version to update to
      "description": "Updates of the Otter Library v3.1.x",
      "factory": "./schematics/ng-update/index#updateV3" // relative path to the schematics factory function to execute
    },
    "migration-v3_2": {
      "version": "3.2.0-alpha.0", // version to update to
      "description": "Updates of the Otter Library v3.2.x",
      "factory": "./schematics/ng-update/index#updateV3_2" // relative path to the schematics factory function to execute                                                               
    }
  }
}
```   

When we run the update on _@o3r/core_ (```yarn ng update @o3r/core```) in our app, ng-cli will install the latest version of @o3r/core and 
it will check the ng-update section in the package.json of the new installed version, to see if there are updates to execute.   
Based on the starting version of @o3r/core and the new installed one, the cli will run the schematics which are between these 2 versions from migration.json  
Here are 2 scenarios: 
### Scenario 1
- Application in otter 3.0, latest stable version of otter is 3.2  

Based on the above _migration.json_ the cli will run __migration-v3__ and __migration-v3_2__ because the versions '3.1.0-alpha.0' and '3.2.0-alpha.0' defined in migration.json are between 3.0 (old version) and 3.2 (latest stable)

### Scenario 2
- Application in otter 3.1, latest stable version of otter is 3.2  

Based on the above _migration.json_ the cli will run __migration-v3_2__ because the version '3.2.0-alpha.0' defined in migration.json is the only one between 3.0 (old version) and 3.2 (latest stable)

## Development time

To be easier to test in local, when we need to create/update schematics, we can use the schematics cli.
  1. install @angular-devkit\schematics-cli on the app, if needed (no need to commit the change)
  2. link (yarn link or cpx) @o3r/core in the app 
  3. run: 
  ```node ./node_modules/@angular-devkit/schematics-cli/bin/schematics.js ./node_modules/@o3r/core/collection.json:update-otter --dry-run=false --force```

One mention for step 3 is that you have to add a new entry in _@o3r/core/collection.json_ to point to the update schematic
```
"update-otter": {
  "description": "test update schematic",
  "factory": "./schematics/ng-update/index#updateV3_2"
}
```
No need to commit this change.

## Testing your schematic with the PR version number 

When you have done the development on the schematic, next steps are required to test that your schematic is working with the normal way of running it (not the way used in dev chapter)  
Steps:   
  - all steps are executed at app level;
  1. modify _.npmrc_ of the app to target the _otter-pr_ versions 
  @o3r:registry=https://pkgs.dev.azure.com/AmadeusDigitalAirline/Otter/_packaging/otter-pr/npm/registry/ (don't forget auth tokens)

  2. run: yarn ng update @o3r/core@prVersion --force   
  ex: ``` yarn ng update @o3r/core@5.4.0-alpha.21-pr.115535 --force```   

The command above will run all schematics update for all packages defined in "ng-update" -> "packageGroup" section in `package.json` file of _@o3r/core_
