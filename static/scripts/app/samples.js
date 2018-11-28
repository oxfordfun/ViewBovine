$(document).ready(function () {
    $("#sample_table").tablesorter();
    $("#sample_table").tablesorter({ sortList: [[0, 0], [1, 0]] });
});

function switch_view() {
    var view_toggle = document.getElementById("view_toggle");
    var map_div = document.getElementById("mapid");
    var table_col = document.getElementById("table_col");
    var map_col = document.getElementById("map_col");
    var table_col_5 = table_col.classList.contains("col-md-5");
    var map_col_7 = map_col.classList.contains("col-md-7");
    if (table_col !== undefined && map_col !== undefined) {
        if (table_col_5 && map_col_7) {
            table_col.classList.remove('col-md-5');
            table_col.classList.add('hidden');
            map_col.classList.remove('col-md-7');
            map_col.classList.add('col-md-12');
            map_div.style.height = "1140px";
            map_div.style.width = "1140px";
            view_toggle.innerHTML = "Show Table";
        }
        else {
            table_col.classList.remove('hidden');
            table_col.classList.add('col-md-5');
            map_col.classList.remove('col-md-12');
            map_col.classList.add('col-md-7');
            map_div.style.height = "570px";
            map_div.style.width = "570px";
            view_toggle.innerHTML = "Hide Table";
        }
    }
    mymap.invalidateSize();
};

function ShowSamples() {
    var show_prompt = document.getElementById("show_samples");
    show_flag = false;
    if (show_prompt.innerHTML.indexOf("All") !== -1){
        show_flag = true
    }
    var sampleselements = document.getElementsByClassName("sample_in_cluster");
    if (sampleselements != undefined && sampleselements.length > 0) {
        if (show_flag) {
            for (i = 0; i < sampleselements.length; i++) {
                sampleselements[i].classList.remove('hidden')
            }
            show_prompt.innerHTML = "Show 1 Sample";
        } else {
            for (i = 0; i < sampleselements.length; i++) {
                sampleselements[i].classList.add('hidden')
            }
            show_prompt.innerHTML = "Show All Samples"
        }        
    }
}

function Show_cohabit_detail(address) {
    var prompt = address.innerHTML;
    var div_id = address.id.substring(4); //skip the "show"
    var div = document.getElementById(div_id);
    if (prompt == "Show Detail") {
        address.innerHTML = "Hide Detail";
        div.classList.remove("hidden");
    } else {
        address.innerHTML = "Show Detail"
        div.classList.add("hidden");
    }
}

function Validateclusterdistance() {
    var first = parseInt(document.getElementById('cluster').value, 10);
    var second = parseInt(document.getElementById('subcluster').value, 10);

    if (first < second) {
        alert("The subcluster distance has to be smaller than the cluster distance.")
    }
}