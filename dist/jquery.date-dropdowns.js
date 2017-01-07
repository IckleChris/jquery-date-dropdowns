/*
 *  jQuery Date Dropdowns - v1.0.0
 *  A simple, customisable date select plugin
 *
 *  Made by Chris Brown
 *  Under MIT License
 */
;(function ($, window, document, undefined) {

    'use strict';

    // Create the defaults once
    var pluginName = 'dateDropdowns',
        pluginDefaults = {
            defaultDate: null,
            defaultDateFormat: 'yyyy-mm-dd',
            displayFormat: 'dmy',
            submitFormat: 'yyyy-mm-dd',
            minAge: 0,
            maxAge: 120,
            minYear: null,
            maxYear: null,
            submitFieldName: 'date',
            wrapperClass: 'date-dropdowns',
            dropdownClass: null,
            daySuffixes: true,
            monthSuffixes: true,
            monthFormat: 'long',
            required: false,
            dayLabel: 'Day',
            monthLabel: 'Month',
            yearLabel: 'Year',
            monthLongValues: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            monthShortValues: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            initialDayMonthYearValues: ['Day', 'Month', 'Year'],
            daySuffixValues: ['st', 'nd', 'rd', 'th']
        };

    // The actual plugin constructor
    function Plugin(element, options) {
        this.element = element;                                 // Element handle
        this.$element = $(element);                             // jQuery element handle
        this.config = $.extend({}, pluginDefaults, options);    // Plugin options
        this.internals = {                                      // Internal variables
            objectRefs: {}
        };
        this.init();

        return this;
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {

        /**
         * Initialise the plugin
         */
        init: function () {
            this.checkForDuplicateElement();
            this.setInternalVariables();
            this.setupMarkup();
            this.buildDropdowns();
            this.attachDropdowns();
            this.bindChangeEvent();

            if (this.config.defaultDate) {
                this.populateDefaultDate();
            }
        },

        /**
         * Check whether an element exists with the same name attribute. If so, throw an error
         */
        checkForDuplicateElement: function () {
            if ($('input[name="' + this.config.submitFieldName + '"]').length) {
                $.error('Duplicate element found');
                return false;
            }

            return true;
        },

        /**
         * Set the plugin's internal variables
         */
        setInternalVariables: function () {
            var date = new Date();
            this.internals.currentDay = date.getDate();
            this.internals.currentMonth = date.getMonth() + 1;
            this.internals.currentYear = date.getFullYear();
        },

        /**
         * Set the container which will hold the date dropdowns.
         *
         * - If the element on which the plugin was called is an input of type text or hidden, set it to
         *   be hidden and wrap it in a div. This outer div will become the container.
         * - If the element was an HTML element (e.g. <div/>), create a hidden text field within it, and use
         *   the div as the container.
         */
        setupMarkup: function () {
            var wrapper, hiddenField;

            if (this.element.tagName.toLowerCase() === 'input') {
                if (!this.config.defaultDate) {
                    this.config.defaultDate = this.element.value;
                }

                // Configure the input element and wrap
                hiddenField = this.$element.attr('type', 'hidden')
                    .wrap('<div class="' + this.config.wrapperClass + '"></div>');

                var customFieldNameProvided = (this.config.submitFieldName !== pluginDefaults.submitFieldName),
                    fieldHasName = this.element.hasAttribute('name');

                // Set the name attribute of the submit input
                if (!fieldHasName && !customFieldNameProvided) {
                    this.$element.attr('name', pluginDefaults.submitFieldName);
                } else if (customFieldNameProvided) {
                    this.$element.attr('name', this.config.submitFieldName);
                }

                wrapper = this.$element.parent();

            } else {

                // Build a hidden input and set this.$element as the wrapper
                hiddenField = $('<input/>', {
                    type: 'hidden',
                    name: this.config.submitFieldName
                });

                this.$element.append(hiddenField).addClass(this.config.wrapperClass);

                wrapper = this.$element;
            }

            // Store a reference to the wrapper and hidden field elements for later use
            this.internals.objectRefs.pluginWrapper = wrapper;
            this.internals.objectRefs.hiddenField = hiddenField;

            return true;
        },

        /**
         * Generate the Day, Month and Year dropdowns
         */
        buildDropdowns: function () {
            var $dayDropdown, $monthDropdown, $yearDropdown;

            Plugin.message = {
                day: this.config.initialDayMonthYearValues[0],
                month: this.config.initialDayMonthYearValues[1],
                year: this.config.initialDayMonthYearValues[2]
            };

            // Build the day dropdown element
            $dayDropdown = this.buildDayDropdown();
            this.internals.objectRefs.dayDropdown = $dayDropdown;

            $monthDropdown = this.buildMonthDropdown();
            this.internals.objectRefs.monthDropdown = $monthDropdown;

            $yearDropdown = this.buildYearDropdown();
            this.internals.objectRefs.yearDropdown = $yearDropdown;

            return true;
        },

        /**
         * Attach the generated dropdowns to the container
         */
        attachDropdowns: function () {
            var $element = this.internals.objectRefs.pluginWrapper,
                $daySelect = this.internals.objectRefs.dayDropdown,
                $monthSelect = this.internals.objectRefs.monthDropdown,
                $yearSelect = this.internals.objectRefs.yearDropdown;

            switch (this.config.displayFormat) {
                case 'mdy':
                    $element.append($monthSelect, $daySelect, $yearSelect);
                    break;
                case 'ymd':
                    $element.append($yearSelect, $monthSelect, $daySelect);
                    break;
                case 'dmy':
                default:
                    $element.append($daySelect, $monthSelect, $yearSelect);
                    break;
            }

            return true;
        },

        /**
         * Bind the change event to the generated dropdowns
         */
        bindChangeEvent: function () {
            var $daySelect = this.internals.objectRefs.dayDropdown,
                $monthSelect = this.internals.objectRefs.monthDropdown,
                $yearSelect = this.internals.objectRefs.yearDropdown,
                pluginHandle = this,
                objectRefs = this.internals.objectRefs;

            objectRefs.pluginWrapper.on('change', 'select', function () {
                var day = $daySelect.val(),
                    month = $monthSelect.val(),
                    year = $yearSelect.val(),
                    invalidDate,
                    newDate;

                // Find out whether the change has made the date invalid (e.g. 31st Feb)
                invalidDate = pluginHandle.checkDate(day, month, year);

                // If invalid - add an error class to the day dropdown and return
                if (invalidDate) {
                    objectRefs.dayDropdown.addClass('invalid');
                    return false;
                }

                if ('00' !== objectRefs.dayDropdown.val()) {
                    objectRefs.dayDropdown.removeClass('invalid');
                }

                // Empty the hidden field after each change
                objectRefs.hiddenField.val('');

                // Only format the submit date if a full date has been selected
                if (!invalidDate && (day * month * year !== 0)) {
                    newDate = pluginHandle.formatSubmitDate(day, month, year);

                    objectRefs.hiddenField.val(newDate);
                }

                objectRefs.hiddenField.change();
            });
        },

        /**
         * Take a provided default date and populate both the hidden field and the
         * dropdown elements with the relevant formatted values
         *
         * @returns {boolean}
         */
        populateDefaultDate: function () {
            var date = this.config.defaultDate,
                parts = [],
                day = '',
                month = '',
                year = '';

            switch (this.config.defaultDateFormat) {
                case 'yyyy-mm-dd':
                default:
                    parts = date.split('-');
                    day = parts[2];
                    month = parts[1];
                    year = parts[0];
                    break;

                case 'dd/mm/yyyy':
                    parts = date.split('/');
                    day = parts[0];
                    month = parts[1];
                    year = parts[2];
                    break;

                case 'mm/dd/yyyy':
                    parts = date.split('/');
                    day = parts[1];
                    month = parts[0];
                    year = parts[2];
                    break;

                case 'unix':
                    parts = new Date();
                    parts.setTime(date * 1000);
                    day = parts.getDate() + '';
                    month = (parts.getMonth() + 1) + '';
                    year = parts.getFullYear();

                    if (day.length < 2) {
                        day = '0' + day;
                    }
                    if (month.length < 2) {
                        month = '0' + month;
                    }
                    break;
            }

            // Set the values on the dropdowns
            this.internals.objectRefs.dayDropdown.val(day);
            this.internals.objectRefs.monthDropdown.val(month);
            this.internals.objectRefs.yearDropdown.val(year);
            this.internals.objectRefs.hiddenField.val(date);

            if (true === this.checkDate(day, month, year)) {
                this.internals.objectRefs.dayDropdown.addClass('invalid');
            }

            return true;
        },

        /**
         * Build a generic dropdown element
         *
         * @param type
         * @returns {*|HTMLElement}
         */
        buildBaseDropdown: function (type) {
            var classString = type;

            if (this.config.dropdownClass) {
                classString += ' ' + this.config.dropdownClass;
            }

            return $('<select></select>', {
                class: classString,
                name: this.config.submitFieldName + '_[' + type + ']',
                required: this.config.required
            });
        },

        /**
         * Build the day dropdown element
         *
         * @returns {*|HTMLElement}
         */
        buildDayDropdown: function () {
            var day,
                dropdown = this.buildBaseDropdown('day'),
                option = document.createElement('option');

            option.setAttribute('value', '');
            option.appendChild(document.createTextNode(this.config.dayLabel));
            dropdown.append(option);

            // Days 1-9
            for (var i = 1; i < 10; i++) {
                if (this.config.daySuffixes) {
                    day = i + this.getSuffix(i);
                } else {
                    day = '0' + i;
                }
                option = document.createElement('option');
                option.setAttribute('value', '0' + i);
                option.appendChild(document.createTextNode(day));
                dropdown.append(option);
            }

            // Days 10-31
            for (var j = 10; j <= 31; j++) {
                day = j;

                if (this.config.daySuffixes) {
                    day = j + this.getSuffix(j);
                }
                option = document.createElement('option');
                option.setAttribute('value', j);
                option.appendChild(document.createTextNode(day));
                dropdown.append(option);
            }

            return dropdown;
        },

        /**
         * Build the month dropdown element
         *
         * @returns {*|HTMLElement}
         */
        buildMonthDropdown: function () {
            var dropdown = this.buildBaseDropdown('month'),
                option = document.createElement('option');

            option.setAttribute('value', '');
            option.appendChild(document.createTextNode(this.config.monthLabel));
            dropdown.append(option);

            // Populate the month values
            for (var monthNo = 1; monthNo <= 12; monthNo++) {

                var month;

                switch (this.config.monthFormat) {
                    case 'short':
                        month = this.config.monthShortValues[monthNo - 1];
                        break;
                    case 'long':
                        month = this.config.monthLongValues[monthNo - 1];
                        break;
                    case 'numeric':
                        month = monthNo;

                        if (this.config.monthSuffixes) {
                            month += this.getSuffix(monthNo);
                        }
                        break;
                }

                if (monthNo < 10) {
                    monthNo = '0' + monthNo;
                }

                option = document.createElement('option');
                option.setAttribute('value', monthNo);
                option.appendChild(document.createTextNode(month));
                dropdown.append(option);
            }

            return dropdown;
        },

        /**
         * Build the year dropdown element.
         *
         * By default minYear and maxYear are null, however if provided they take precedence over
         * the minAge and maxAge values.
         *
         * @returns {*|HTMLElement}
         */
        buildYearDropdown: function () {
            var minYear = this.config.minYear,
                maxYear = this.config.maxYear,
                dropdown = this.buildBaseDropdown('year'),
                option = document.createElement('option');

            option.setAttribute('value', '');
            option.appendChild(document.createTextNode(this.config.yearLabel));
            dropdown.append(option);

            if (!minYear) {
                minYear = this.internals.currentYear - (this.config.maxAge + 1);
            }

            if (!maxYear) {
                maxYear = this.internals.currentYear - this.config.minAge;
            }

            for (var i = maxYear; i >= minYear; i--) {
                option = document.createElement('option');
                option.setAttribute('value', i);
                option.appendChild(document.createTextNode(i));
                dropdown.append(option);
            }

            return dropdown;
        },

        /**
         * Get the relevant suffix for a day/month number
         *
         * @param number
         * @returns {string}
         */
        getSuffix: function (number) {
            var suffix = '';
            var st = this.config.daySuffixValues[0];
            var nd = this.config.daySuffixValues[1];
            var rd = this.config.daySuffixValues[2];
            var th = this.config.daySuffixValues[3];

            switch (number % 10) {
                case 1:
                    suffix = (number % 100 === 11) ? th : st;
                    break;
                case 2:
                    suffix = (number % 100 === 12) ? th : nd;
                    break;
                case 3:
                    suffix = (number % 100 === 13) ? th : rd;
                    break;
                default:
                    suffix = 'th';
                    break;
            }

            return suffix;
        },

        /**
         * Check whether the date entered is invalid, e.g. 31st Feb
         *
         * @param day
         * @param month
         * @param year
         * @returns {boolean}
         */
        checkDate: function (day, month, year) {
            var invalidDate;

            if (month !== '00') {
                var numDaysInMonth = (new Date(year, month, 0).getDate()),
                    selectedDayInt = parseInt(day, 10);

                invalidDate = this.updateDayOptions(numDaysInMonth, selectedDayInt);

                // If the date is invalid, empty the hidden field to prevent invalid submissions
                if (invalidDate) {
                    this.internals.objectRefs.hiddenField.val('');
                }
            }

            return invalidDate;
        },

        /**
         * Update the day options available based on the month now selected
         *
         * @param numDaysInMonth
         * @param selectedDayInt
         * @returns {boolean}
         */
        updateDayOptions: function (numDaysInMonth, selectedDayInt) {
            var lastDayOption = parseInt(this.internals.objectRefs.dayDropdown.children(':last').val(), 10),
                newDayOption = '',
                newDayText = '',
                invalidDay = false;

            // If the selected month has less days than the Day dropdown currently contains - remove the extra days
            if (lastDayOption > numDaysInMonth) {

                while (lastDayOption > numDaysInMonth) {
                    this.internals.objectRefs.dayDropdown.children(':last').remove();
                    lastDayOption--;
                }

                // If the user-selected day is removed, indicate this so a message can be shown to the user
                if (selectedDayInt > numDaysInMonth) {
                    invalidDay = true;
                }

                // If the month contains more days than the Day dropdown contains - add the missing options
            } else if (lastDayOption < numDaysInMonth) {

                while (lastDayOption < numDaysInMonth) {

                    newDayOption = ++lastDayOption;
                    newDayText = newDayOption;

                    // Add the suffix if required
                    if (this.config.daySuffixes) {
                        newDayText += this.getSuffix(lastDayOption);
                    }

                    // Build the option and append to the dropdown
                    var option = document.createElement('option');
                    option.setAttribute('value', newDayOption);
                    option.appendChild(document.createTextNode(newDayText));
                    this.internals.objectRefs.dayDropdown.append(option);
                }
            }

            return invalidDay;
        },

        /**
         * Format the selected date based on the submitFormat config value provided
         *
         * @param day
         * @param month
         * @param year
         * @returns {*}
         */
        formatSubmitDate: function (day, month, year) {
            var formattedDate,
                _date;

            switch (this.config.submitFormat) {
                case 'unix':
                    _date = new Date();
                    _date.setDate(day);
                    _date.setMonth(month - 1);
                    _date.setYear(year);
                    formattedDate = Math.round(_date.getTime() / 1000);
                    break;

                default:
                    formattedDate = this.config.submitFormat
                        .replace('dd', day)
                        .replace('mm', month)
                        .replace('yyyy', year);
                    break;
            }

            return formattedDate;
        },

        /**
         * Revert the changes applied by the plugin on the specified element
         */
        destroy: function () {
            var wrapperClass = this.config.wrapperClass;

            if (this.$element.hasClass(wrapperClass)) {
                this.$element.empty();
            } else {
                var $parent = this.$element.parent(),
                    $select = $parent.find('select');

                this.$element.unwrap();
                $select.remove();
            }
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        this.each(function () {
            if (typeof options === 'string') {
                var args = Array.prototype.slice.call(arguments, 1);
                var plugin = $.data(this, 'plugin_' + pluginName);

                if (typeof plugin === 'undefined') {
                    $.error('Please initialize the plugin before calling this method.');
                    return false;
                }
                plugin[options].apply(plugin, args);
            } else {
                if (!$.data(this, 'plugin_' + pluginName)) {
                    $.data(this, 'plugin_' + pluginName, new Plugin(this, options));
                }
            }
        });
        // chain jQuery functions
        return this;
    };

})(jQuery, window, document);
