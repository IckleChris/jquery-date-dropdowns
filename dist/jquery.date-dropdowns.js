/*
 *  jQuery Date Dropdowns - v0.1.0
 *  A simple, customisable date select plugin
 *
 *  Made by Chris Brown
 *  Under MIT License
 */
;(function ($, window, document, undefined) {

	"use strict";

	// Create the defaults once
	var pluginName = "dateDropdowns",
		pluginDefaults = {
			defaultDate: null,
			defaultDateFormat: "yyyy-mm-dd",
			displayFormat: "dmy",
			submitFormat: "yyyy-mm-dd",
			minAge: 0,
			maxAge: 120,
			minYear: null,
			maxYear: null,
			submitFieldName: "date",
			wrapperClass: "date-dropdowns",
			daySuffixes: true,
			monthSuffixes: true,
			monthFormat: "long"
		};

	// The actual plugin constructor
	function Plugin (element, options) {
		this.element = element;									// Element handle
		this.$element = $(element);								// jQuery element handle
		this.config = $.extend({}, pluginDefaults, options);	// Plugin options
		this.internals = {										// Internal variables
			objectRefs: {}										// Generated element references
		};
		this._defaults = pluginDefaults;						// Reference to the plugin defaults
		this._name = pluginName;								// Reference to the plugin name
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
		checkForDuplicateElement: function() {
			if ($("input[name=\"" + this.config.submitFieldName + "\"]").length) {
				$.error("Duplicate element found");
				return false;
			}

			return true;
		},

		/**
		 * Set the plugin"s internal variables
		 */
		setInternalVariables: function() {
			var date = new Date();
			this.internals.currentDay = date.getDate();
			this.internals.currentMonth = date.getMonth() + 1;
			this.internals.currentYear = date.getFullYear();
			this.internals.monthShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
			this.internals.monthLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		},

		/**
		 * Set the container which will hold the date dropdowns.
		 *
		 * - If the element on which the plugin was called is an input of type text or hidden, set it to
		 *   be hidden and wrap it in a div. This outer div will become the container.
		 * - If the element was an HTML element (e.g. <div/>), create a hidden text field within it, and use
		 *   the div as the container.
		 */
		setupMarkup: function() {
			var wrapper, hiddenField;

			if (this.element.tagName.toLowerCase() === "input") {

				// Configure the input element and wrap
				hiddenField = this.$element.attr("type", "hidden") // Set to type hidden after development
										   .wrap("<div class=\"" + this.config.wrapperClass + "\"></div>");

				wrapper = this.$element.parent();

			} else {

				// Build a hidden input and set this.$element as the wrapper
				hiddenField = $("<input/>", {
					type: "hidden", // Set to type hidden after development
					name: this.internals.submitFieldName
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
		buildDropdowns: function() {
			var $dayDropdown, $monthDropdown, $yearDropdown;

			// Build the day dropdown element
			$dayDropdown = this.buildDayDropdown();
			this.internals.objectRefs.dayDropdown = $dayDropdown;

			$monthDropdown = this.buildMonthDropdown();
			this.internals.objectRefs.monthDropdown = $monthDropdown;

			$yearDropdown = this.buildYearDropdown();
			this.internals.objectRefs.yearDropdown = $yearDropdown;

			return true;

			//this.internals.objectRefs.pluginWrapper.append($dayDropdown)
			//		 .append($monthDropdown)
			//		 .append($yearDropdown);
		},

		/**
		 * Attach the generated dropdowns to the container
		 */
		attachDropdowns: function() {
			var $element = this.internals.objectRefs.pluginWrapper,
				$daySelect = this.internals.objectRefs.dayDropdown,
				$monthSelect = this.internals.objectRefs.monthDropdown,
				$yearSelect = this.internals.objectRefs.yearDropdown;

			switch (this.config.displayFormat) {
				case "mdy":
					$element.append($monthSelect, $daySelect, $yearSelect);
					break;
				case "ymd":
					$element.append($yearSelect, $monthSelect, $daySelect);
					break;
				case "dmy":
				default:
					$element.append($daySelect, $monthSelect, $yearSelect);
					break;
			}

			return true;
		},

		/**
		 * Bind the change event to the generated dropdowns
		 */
		bindChangeEvent: function() {
			var $daySelect = this.internals.objectRefs.dayDropdown,
				$monthSelect = this.internals.objectRefs.monthDropdown,
				$yearSelect = this.internals.objectRefs.yearDropdown,
				pluginHandle = this,
				objectRefs = this.internals.objectRefs;

			objectRefs.pluginWrapper.on("change", "select", function() {
				var day = $daySelect.val(),
					month = $monthSelect.val(),
					year = $yearSelect.val(),
					invalidDate = true,
					newDate;

				// Find out whether the change has made the date invalid (e.g. 31st Feb)
				invalidDate = pluginHandle.checkDate(day, month, year);

				// If invalid - add an error class to the day dropdown and return
				if (invalidDate) {
					objectRefs.dayDropdown.addClass("invalid");
					return false;
				}

				if ("00" !== objectRefs.dayDropdown.val()) {
					objectRefs.dayDropdown.removeClass("invalid");
				}

				// Only format the submit date if a full date has been selected
				if (!invalidDate && (day * month * year !== 0)) {
					newDate = pluginHandle.formatSubmitDate(day, month, year);

					objectRefs.hiddenField.val(newDate);
				}
			});
		},

		/**
		 * Take a provided default date and populate both the hidden field and the
		 * dropdown elements with the relevant formatted values
		 *
		 * @returns {boolean}
		 */
		populateDefaultDate: function() {
			var date    = this.config.defaultDate,
				parts   = [],
				day     = "00",
				month   = "00",
				year    = "0000";

			switch (this.config.defaultDateFormat) {
				case "yyyy-mm-dd":
				default:
					parts = date.split("-");
					day = parts[2];
					month = parts[1];
					year = parts[0];
					break;

				case "dd/mm/yyyy":
					parts = date.split("/");
					day = parts[0];
					month = parts[1];
					year = parts[2];
					break;

				case "mm/dd/yyyy":
					parts = date.split("/");
					day = parts[1];
					month = parts[0];
					year = parts[2];
					break;
			}

			// Set the values on the dropdowns
			this.internals.objectRefs.dayDropdown.val(day);
			this.internals.objectRefs.monthDropdown.val(month);
			this.internals.objectRefs.yearDropdown.val(year);
			this.internals.objectRefs.hiddenField.val(date);

			if (true === this.checkDate(day, month, year)) {
				this.internals.objectRefs.dayDropdown.addClass("invalid");
			}

			return true;
		},

		/**
		 * Build a generic dropdown element
		 *
		 * @param type
		 * @returns {*|HTMLElement}
		 */
		buildBaseDropdown: function(type) {
			return $("<select></select>", {
				class: type,
				name: this.config.submitFieldName + "_[" + type + "]"
			});
		},

		/**
		 * Build the day dropdown element
		 *
		 * @returns {*|HTMLElement}
		 */
		buildDayDropdown: function() {
			var day,
				dropdown = this.buildBaseDropdown("day");

			$("<option value=\"00\">Day</option>").appendTo(dropdown);

			// Days 1-9
			for (var i = 1;  i < 10; i++) {
				if (this.config.daySuffixes) {
					day = i + this.getSuffix(i);
				} else {
					day = "0" + i;
				}
				$("<option value=\"0" + i + "\">" + day + "</option>").appendTo(dropdown);
			}

			// Days 10-31
			for (var j = 10;  j <= 31; j++) {
				day = j;

				if (this.config.daySuffixes) {
					day = j + this.getSuffix(j);
				}

				$("<option value=\"" + j + "\">" + day + "</option>").appendTo(dropdown);
			}

			return dropdown;
		},

		/**
		 * Build the month dropdown element
		 *
		 * @returns {*|HTMLElement}
		 */
		buildMonthDropdown: function() {
			var dropdown = this.buildBaseDropdown("month");

			$("<option value=\"00\">Month</option>").appendTo(dropdown);

			// Populate the month values
			for (var monthNo = 1; monthNo <= 12; monthNo++) {

				var month;

				switch (this.config.monthFormat) {
					case "short":
						month = this.internals.monthShort[monthNo - 1];
						break;
					case "long":
						month = this.internals.monthLong[monthNo - 1];
						break;
					case "numeric":
						month = monthNo;

						if (this.config.monthSuffixes) {
							month += this.getSuffix(monthNo);
						}
						break;
				}

				if (monthNo < 10) {
					monthNo = "0" + monthNo;
				}

				$("<option value=\"" + monthNo + "\">" + month + "</option>").appendTo(dropdown);
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
		buildYearDropdown: function() {
			var minYear = this.config.minYear,
				maxYear = this.config.maxYear,
				dropdown = this.buildBaseDropdown("year");

			$("<option value=\"0000\">Year</option>").appendTo(dropdown);

			if (!minYear) {
				minYear = this.internals.currentYear - (this.config.maxAge + 1);
			}

			if (!maxYear) {
				maxYear = this.internals.currentYear - this.config.minAge;
			}

			for (var i = maxYear; i >= minYear; i--) {
				$("<option value=\"" + i + "\">" + i + "</option>").appendTo(dropdown);
			}

			return dropdown;
		},

		/**
		 * Get the relevant suffix for a day/month number
		 *
		 * @param number
		 * @returns {string}
		 */
		getSuffix: function(number) {
			var suffix = "";

			switch (number % 10){
				case 1:
					suffix = (number % 100 === 11) ? "th" : "st";
					break;
				case 2:
					suffix = (number % 100 === 12) ? "th" : "nd";
					break;
				case 3:
					suffix = (number % 100 === 13) ? "th" : "rd";
					break;
				default:
					suffix = "th";
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
		checkDate: function(day, month, year) {
			var invalidDate;

			if (month !== "00") {
				var numDaysInMonth = (new Date(year, month, 0).getDate()),
					selectedDayInt = parseInt(day, 10);

				invalidDate = this.updateDayOptions(numDaysInMonth, selectedDayInt);

				// If the date is invalid, empty the hidden field to prevent invalid submissions
				if (invalidDate) {
					this.internals.objectRefs.hiddenField.val("");
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
		updateDayOptions: function(numDaysInMonth, selectedDayInt) {
			var lastDayOption = parseInt(this.internals.objectRefs.dayDropdown.children(":last").val(), 10),
				newDayOption = "",
				newDayText = "",
				invalidDay = false;

			// If the selected month has less days than the Day dropdown currently contains - remove the extra days
			if (lastDayOption > numDaysInMonth) {

				while (lastDayOption > numDaysInMonth) {
					this.internals.objectRefs.dayDropdown.children(":last").remove();
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
					$("<option></option>")
						.attr("value", newDayOption)
						.text(newDayText)
						.appendTo(this.internals.objectRefs.dayDropdown);
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
		formatSubmitDate: function(day, month, year) {
			var formattedDate;

			switch (this.config.submitFormat) {
				case "yyyy-mm-dd":
				default:
					formattedDate = year + "-" + month + "-" + day;
					break;

				case "mm/dd/yyyy":
					formattedDate = month + "/" + day + "/" + year;
					break;

				case "dd/mm/yyyy":
					formattedDate = day + "/" + month + "/" + year;
					break;
			}

			return formattedDate;
		}
	});

	// A really lightweight plugin wrapper around the constructor,
	// preventing against multiple instantiations
	$.fn[ pluginName ] = function ( options ) {
		this.each(function() {
			if ( !$.data( this, "plugin_" + pluginName ) ) {
				$.data( this, "plugin_" + pluginName, new Plugin( this, options ) );
			}
		});

		// chain jQuery functions
		return this;
	};

})( jQuery, window, document );
