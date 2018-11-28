var keys = ['distance'];
var values = ['neighbours'];
var slopes = ['slope', 0,]
var flat_length = 10


$('.counts_keys').each(function () {
    keys.push($(this).html());
});
$('.counts_values').each(function () {
    length = values.length;
    if (length > 1) {
        slope = $(this).html() - values[length - 1];
        slopes.push(slope);
    }
    values.push($(this).html());
});

console.log(slopes);
var element = document.getElementById("threshold");
var cutoff = element.innerHTML;

var chart = c3.generate({
    bindto: '#chart',
    data: {
        columns: [
            values,
            slopes
        ]
    },
    regions: [
        { start: 0, end: cutoff }
    ]
});

