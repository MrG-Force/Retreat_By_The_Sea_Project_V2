/**
 * @file Validates the Contact Form data of the "Sorrento by the Sea" website.
 * @author Guillermo Ortiz <guillermo.ortizloza@studytafensw.edu.au>
 * @version 2.0
 * */

// 1. Assign input elements to constants for easy access
//#region FORM and its input ELEMENTS
const FORM = document.getElementById('form-to-validate'),
    FIRST = document.getElementById('first'),
    LAST = document.getElementById('last'),
    PHONEPREF = document.getElementById("phone-pref")
    EMAILPREF = document.getElementById("email-pref"),
    EMAIL = document.getElementById('email'),
    PHONE = document.getElementById('phone'),
    INFO = document.getElementById('info'),
    CHECK = document.getElementById('policy'),
    BUTTON = document.getElementById("submit-btn");
//#endregion

// 2. When page load make sure the form is clean
FORM.reset();

// 3. Set up variables
//#region Variables
var isFormValid = false;
var contactPref = ""; // not too sure about the need of this one
var formElements = [FIRST, LAST, EMAIL, PHONE, INFO, CHECK]; // Array to iterate over the form objects

BUTTON.disabled = true;
EMAIL.disabled = true;
PHONE.disabled = true;

//#endregion
window.addEventListener('load', function () {addListeners(); });

function addListeners() {
    // adds a listener to validate corresponding element on input
    formElements.forEach(element => {
        element.addEventListener('input', function () { ValidateElement(element); })
        //console.log(`addListener added ValidateElement function to "${element.id}" on "input"`)
    });
    formElements.forEach(element => {
        element.addEventListener('blur', function () { ValidateElement(element); })
    });
    // adds a listener to validate corresponding element when looses focus
    formElements.forEach(element => {
        element.addEventListener('blur', function () { ValidateElement(element); })
        //console.log(`addListener added ValidateElement function to "${element.id}" on "blur"`)
    });
    // adds a listener to remove warning messages when element is on focus
    formElements.forEach(element => {
        element.addEventListener('focus', function () { ResetValid(element); })
    });
    // adds a listener for the preferred contact method radio input
    document.getElementsByName('preference').forEach(element => {
        element.addEventListener('change', function () { ContactPref(); } )
    });
    // adds a listener to validate form on every input
    FORM.addEventListener('input', function () { ValidateForm(); });
    // adds a listener to count and display a character count under textarea
    INFO.addEventListener('keyup', countCharacters, false);
    CHECK.addEventListener('change', function () { ValidateForm(); });
    INFO.addEventListener('blur', function () { ValidateForm(); });

}
/**
 * Enables email or phone input fields accordingly with
 * user's selection.
 */
function ContactPref() {
    ResetValid(EMAIL);
    ResetValid(PHONE);
    EMAIL.value = '';
    PHONE.value = '';
    if (PHONEPREF.checked) {
        PHONE.disabled = false;
        PHONE.placeholder = "Australian number e.g. 02 1234 4321 ";
        EMAIL.disabled = true;
        EMAIL.placeholder = "Disabled"
    } else {
        EMAIL.disabled = false;
        EMAIL.placeholder = "e.g. johnsmith@mail.com";
        PHONE.disabled = true;
        PHONE.placeholder = "Disabled"
    }
    ValidateForm();
}
/**
 * Checks that the passed element is valid and adds
 * corresponding validity pseudoclasses to the element
 * @param  {Element} element An Element object describing the DOM element. 
 */
function ValidateElement(element) {
    ResetValid(element);
    switch (element.id) {
        case 'first':       
        if (!ValidName(element.value)) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
        case 'last':        
        if (!ValidName(element.value)) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
        case 'email':
        if (!ValidEmail(element.value)) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
        case 'phone':
        if (!ValidPhone(element.value)) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
        case 'info':
        if (!TextEntered(element.value)) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
        case 'policy':
        if (!element.checked) {
            element.classList.add('is-invalid');
        } else {
            element.classList.add('is-valid');
        }
        break;
    }
}

/**
 * Checks input against a valid name regular expression.
 * Must contain only letters, sorry X Æ A-12.
 * @param {string} name 
 * @returns {boolean}
 */
function ValidName(name) {
    let regName = /^[a-zA-Z]{1,100}$/;
    return regName.test(name);
}

/**
 * Checks input against a valid email regular expression.
 * @param {string} email The email entered.
 * @returns {boolean} 
 */
 function ValidEmail(email) {
    let pattern = new RegExp(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/);
    return pattern.test(email);
}

/**
 * Checks that the phone number is in valid format
 * @param {number} phone A valid Australian phone number.
 * @returns {boolean}
 */
 function ValidPhone(phone) {
    let pattern = new RegExp(/^(?:\+?61|0)[2-478](?:[ -]?[0-9]){8}$/);
    return pattern.test(phone);
}

/**
 * Checks that input is at least 10 characters long.
 * @param {string} info The required information about the enquiry.
 * @returns {boolean}
 */
 function TextEntered(info) {
    if (info.length < 10) {
        return false;
    } else {
        return true;
    }
}

/**
 * Removes CSS validity pseudo-classes. 
 * @param {Element} element An Element object describing the DOM element.
 */
function ResetValid(element) {
    element.classList.remove('is-invalid');
    element.classList.remove('is-valid');
}

/**
 * Checks that the form doesn't have any invalid fields. Sets the isFormValid variable to true.
 * @returns {boolean}
 */
 function ValidateForm() {
    let invalidEl = 0;
    for (let index = 0; index < formElements.length - 1; index++) { // Check all elements except Checkbox
        if (formElements[index].classList.contains("is-invalid")
            || (formElements[index].value === "" && formElements[index].disabled == false)) {
            console.log(formElements[index].id);
            invalidEl++;
        }
    }
    console.log(`invalid elements = "${invalidEl}"`);
    // Checks that all the elements of the form are valid including the checkbox
    // Enables the submit button and sets form to valid if everything looks sweet
    if (!invalidEl && CHECK.checked && (PHONEPREF.checked || EMAILPREF.checked)) {
        BUTTON.disabled = false;
        isFormValid = true;
        return true;
    } else {
        BUTTON.disabled = true;
        isFormValid = false;
        return false;
    }
}

//#region A little extra something
/**
 * Counts the characters entered and display counter in the corresponding tag.
 * @param {Event} e An event object.
 */
 function countCharacters(e) {
    let textEntered, countRemaining, counter;
    textEntered = INFO.value;
    counter = (textEntered.length);
    countRemaining = document.getElementById('counter');
    countRemaining.textContent = `${counter} / 500`;
}
//#endregion
