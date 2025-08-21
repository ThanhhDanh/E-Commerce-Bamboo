const handlebars = require('handlebars');

handlebars.registerHelper('formatPrice', function (price) {
    if (typeof price !== 'number') return '';
    const priceString = price.toString();
    const characters = priceString.split('');
    for (let i = characters.length - 3; i > 0; i -= 3) {
        characters.splice(i, 0, '.');
    }

    return characters.join('') + ` VNĐ`;
});
