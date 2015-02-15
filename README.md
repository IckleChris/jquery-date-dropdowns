#jQuery Dropdown Datepicker

**A simple, customisable date select plugin**  
**Note:** This plugin is effectively still in _beta_. If you use it and it catches fire, put it out and file an accident report.

##Usage
     $("#date_of_birth").dateDropdowns({
         configOption: configValue
     });

The plugin can be initialised either directly on an input field, or on a container element (e.g. a `<div>`).
##Configuration Options

####daySuffixes

Type: `boolean`  
Default: `true`

Indicates whether day numbers should include their suffixes when displayed to the user (e.g. 1st, 2nd, 3rd)

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

####submitFieldName

Type: `string`  
Default: `date`  

Specify the name attribute for the hidden field that will contain the formatted date for submission

####submitFormat

Type: `string`  
Default: `yyyy-mm-dd`  
Options: `dd/mm/yyyy`, `mm/dd/yyyy`

Specify the format the submitted date should take

####wrapperClass

Type: `string`  
Default: `date-dropdowns`  

Specify a classname to add to the widget wrapper

---

###To Come
- Ability to specify relative dates as default values (e.g. `today`, `+1 week` or `my wedding anniversary`).
- Ability to pass an instantiated `date()` object as a default value
- And maybe more, who knows..
