As previously explained, dates can be generated differently based on the specifications and the generator options.
The possible types include:
- `Date`
- `string`
- `utils.Date`
- `utils.DateTime`

For this exercise, we will focus on the types `Date` and `utils.DateTime` to compare how these are impacted by timezones.

### Exercise

As you can see on the right, we have provided a template component file to be filled. There are three variables to update:
- `dateValue` : A stringified date value that will be used to initialize the other two variables
- `date` : Date variable of type `Date`
- `utils.Date` : Date variable of type `utils.DateTime`

Start by setting `dateValue`, which should respect the following format that includes the timezone:
**YYYY-MM-DDTHH:MM:SS+HH:MM**. It is best to set a timezone different than your local environment to notice a
difference between the two variables later on.

Next, initialize the values of `date` and `dateTime` in the function `updateValues()`.
This function is called in the constructor and can be triggered when clicking the **"Update Values"** button in the
preview of the application.

If correctly set, you should see the values appear in the table of the application. Since you have set the date value in
a timezone different from your local environment, you can see that the values of the two variables are different.
This is normal since `utils.DateTime` ignores the timezone of the date value (as explained in its documentation).

You can play around with these values to see how they are impacted by changing the timezone of your local environment
and clicking on the **"Update Values"** button (do not refresh the page). You should observe that the `Date`
value is updated while the `utils.DateTime` value is not impacted.
