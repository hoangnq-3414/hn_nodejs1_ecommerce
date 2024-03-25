// constructor validator
function Validator(options) {
    function getParent(element, selector) {
        while (element.parentElement) {

            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            }
            element = element.parentElement;
        }
    }

    var selectorRules = {};

    // ham thuc hien valiate
    function validate(inputElement, rule) {
        var errorMessage;
        var errorElement =
            getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);

        // lay ra cac rules cuar selector
        var rules = selectorRules[rule.selector];

        // lap qua tung rule & kiem tra, neu co loi thi dung kiem tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](formElement.querySelector(rule.selector + ':checked'));
                    break;
                default:
                    errorMessage = rules[i](inputElement.value);
                    if (errorMessage) break;
            }
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid");
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid");
        }
        return !errorMessage;
    }
    // lay element cua form can validate
    var formElement = document.querySelector(options.form);
    if (formElement) {
        // khi submit
        formElement.onsubmit = function (e) {
            e.preventDefault();

            var isFormValid = true;

            // lap qua tung rules va validate
            options.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                }
            });

            console.log(isFormValid);

            if (isFormValid) {
                // submit voi js
                if (typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]:not([disable])');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked').value;
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values;
                                }
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                }
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});

                    options.onSubmit(formValues);
                }
                // submit voi hanh vi mac dinh
                else {
                    formElement.submit();
                }
            }
        }

        // lap qua moi rule va xu ly (lang nghe su kien blur, input,....)
        options.rules.forEach(function (rule) {
            // luu lai cac rule cho moi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                //   xu ly khi blur ra khoi input
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                };
                //  xu ly khi nguoi dung nhap input
                inputElement.oninput = function () {
                    var errorElement =
                        getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = '';
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                }
            })
        });
    }
}

// define rules
// nguyen tac cua cac rule
//  1. khi co loi => tra ra message loi
//  2. khi hop le => khong tra gia gi ca
Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message || "Vui long nhap truong nay";
        },
    };
};

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : message || 'nhap dung dinh dang email';
        },
    };
};

Validator.minLenght = function (selector, min, message) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} kí tự`
        },
    };
};

Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || 'gia tri nhap khong chinh xac'
        },
    };
};
