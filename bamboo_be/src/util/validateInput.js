const handlebars = require('handlebars');

handlebars.registerHelper('validateInput', function(errors, fieldName) {
    if (errors && errors[fieldName]) {
        return new handlebars.SafeString(`<span class="text-danger validate">${errors[fieldName].msg}</span>`);
    }
    return '';
});