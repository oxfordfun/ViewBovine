$(document).ready(function () {
    $("#status_table").tablesorter();
    $("#status_table").tablesorter({ sortList: [[0, 0], [1, 0]] });
});

$('#search_tree').keyup(function () {
    var searchStr = $(this).val();
    searchStr = searchStr.toLowerCase();
    var total = 0;
    $("#status_table tr").each(function (index) {
        if (!index) return;
        var guid = $(this).find("td").eq(1).text().toLowerCase();
        if (guid.indexOf(searchStr) !== -1) {
            $(this).toggle(true);
            total++;
        }
        else
            $(this).toggle(false);
    });
    $("#count").text(" " + total + " results");
});
