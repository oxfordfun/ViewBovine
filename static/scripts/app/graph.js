var keys = ['distance'];
var values = ['neighbours'];
var slopes = ['slope', 0, ]
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

var index = 1;
var count = 0;
var cutoff = slopes.length;
while (index < cutoff && count < flat_length) {
    if (slopes[index] === 0) {
        count++;
    }
    else {
        count = 0;
    }
    index++;
}

if (index <= cutoff) {
    if (index > (flat_length + 2) && index !== cutoff) {
        cutoff = index - flat_length - 2;
    }
    else {
        cutoff = index - count - 2;
    }
    var threshold_element = document.getElementById("th1");
    threshold_element.innerHTML = cutoff;
}

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

