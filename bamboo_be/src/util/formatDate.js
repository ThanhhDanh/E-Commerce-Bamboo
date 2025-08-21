const handlebars = require('handlebars');
const moment = require('moment');

handlebars.registerHelper('formatDate', function (date, format, fromNow = false) {
    moment.locale('vi');

    if (fromNow === true) {
        return moment(date).fromNow();
    }

    return moment(date).format(format);
});
