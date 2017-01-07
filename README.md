#jQuery Dropdown Datepicker

**A simple date select plugin.**
####[Demo](http://icklechris.github.io/jquery-date-dropdowns/)

##Installation
####Bower
`bower install -S jquery-date-dropdowns`

##Usage
####Instantiation

```js
 $("#date_of_birth").dateDropdowns({
     configOption: configValue
 });
```

The plugin can be initialised either directly on an input field, or on a container element (e.g. a `<div>`).

####Date Validation
The **Day** dropdown's options change automatically depending on the month selected. If the day value is rendered invalid after the selection of a month (e.g. selecting February when the selected day is 31st) the day dropdown is reset and a class of **invalid** is applied, remaining until a valid day is selected.

##Configuration Options

####dayLabel

Type: `string`
Default: `Day`

Identifies the "Day" dropdown

####daySuffixes

Type: `boolean`  
Default: `true`

Indicates whether day numbers should include their suffixes when displayed to the user (e.g. 1st, 2nd, 3rd)

####daySuffixValues

Type: `array`
Default: `['st', 'nd', 'rd', 'th']`

Ordinal indicators (can be overridden for internationalisation purposes)

####defaultDate

Type: `string`  
Default: `null`

Populate the widget with a default date. Use with **defaultDateFormat**

####defaultDateFormat

Type: `string`  
Default: `yyyy-mm-dd`  
Options: `dd/mm/yyyy`, `mm/dd/yyyy`

The format of the date string provided to **defaultDate**

####displayFormat

Type: `string`  
Default: `dmy`  
Options: `myd`, `ymd`

Specify the order in which the dropdown fields should be rendered. Defaults to Day Month Year

####dropdownClass

Type: `string`  
Default: `null`  

Set the class attribute of generated dropdown elements

####initialDayMonthYearValues

Type: `array`
Default: `['Day', 'Month', 'Year']`

Initial dropdown values (can be overridden for internationalisation purposes)

####maxAge

Type: `int`  
Default: `120`

Indicates the maximum age the widget will accept

####maxYear

Type: `int`  
Default: `null`

The highest year option that will be available. **Note:** this will take precedence over **minAge**

####minAge

Type: `int`  
Default: `0`

Indicates the minimum age the widget will accept

####minYear

Type: `int`  
Default: `null`

The lowest year option that will ba available. **Note:** this will take precedence over **maxAge**

####monthFormat

Type: `string`  
Default: `long`  
Options: `numeric`, `short`

Specify the format dates should be in when presented to the user

####monthLabel

Type: `string`
Default: `Month`

Identifies the "Month" dropdown

####monthLongValues

Type: `array`
Default: `['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']`

Long month dropdown values (can be overridden for internationalisation purposes)

####monthShortValues

Type: `array`
Default: `['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']`

Short month dropdown values (can be overridden for internationalisation purposes)

####monthSuffixes

type: `boolean`
Default: `true`

Indicates whether month numbers should include their suffixes when displayed to the user (e.g. 1st, 2nd, 3rd)

####required

Type: `boolean`  
Default: `false`

Whether the `required` html5 attribute should be applied to the generated `<select/>` elements

####submitFieldName

Type: `string`  
Default: `date`  

Specify the name attribute for the hidden field that will contain the formatted date for submission. **Note:** this will overwrite an existing name attribute on an input element

####submitFormat

Type: `string`  
Default: `yyyy-mm-dd`  

Specify the format the submitted date should take using `dd`, `mm` and `yyyy` placeholders. For example `dd/mm/yyyy` will render `30/12/2000`

####wrapperClass

Type: `string`  
Default: `date-dropdowns`  

Specify a classname to add to the widget wrapper

####yearLabel

Type: `string`
Default: `Year`

Identifies the "Year" dropdown

---

###Methods

####destroy

Call the destroy method to undo any changes made during the plugin's initialisation.

Example:

```js
$("#date-dropdown").dateDropdowns('destroy');
```

###Contributing
Feel free to submit any fixes or propose any additional functionality via pull request or issue, making sure any changes take place in `/src`. Any code changes must pass the JSHint validation, and where possible also update the minified file.

####Minification and Validation
Both are automated via Grunt. Run `npm_install` to install the required dependencies, then run `grunt` from the root of the project to handle the tasks.

###To Come
- Ability to specify relative dates as default values (e.g. `today`, `+1 week` or `my wedding anniversary`).
- Ability to pass an instantiated `date()` object as a default value
- Similarly formatted time inputs (hours : minutes, optional seconds). This is likely to be a separate file to avoid unnecessary bloat for users who only need date inputs, but a merged version should also be available.
- And maybe more, who knows..
