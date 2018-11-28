(function (Phylocanvas) {
    var tree = Phylocanvas.createTree('phylocanvas');
    tree.setTreeType('circular')
    tree.setNodeSize(1);
    tree.setTextSize(20);
    tree.lineWidth = 1;
    tree.on('error', function (event) { throw event.error; });
    tree.on('loaded', function () {
        console.log('loaded');
    });
    var tree_input = document.getElementById("nwk_input").value;
    tree.load(tree_input);
    window.tree = tree // closure out
})(window.Phylocanvas);

$('.btn').click(function (e) {
    document.getElementById("phylocanvas").hidden = false;

    var tree_input = document.getElementById("nwk_input").value;
    var radioValue = $(e.target.children[0]).val()
    if (radioValue) {
        tree.setTreeType(radioValue);
    }
    tree.load(tree_input);

    tree_name = document.getElementById("current_tree").innerHTML;
    if (tree_name === "PHE") {
        if (radioValue === "circular") {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'square', 8, 'rgb(255, 0, 0)', 20)
            }
        }
        if (radioValue === "rectangular" || radioValue === "hierarchical" || radioValue === "diagonal") {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'square', 2, 'rgb(255, 0, 0)', 5)
            }
        }
        if (radioValue === "radial" ) {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'square', 1, 'rgb(255, 0, 0)', 1)
            }
        }
    }

    if (tree_name === "APHA-2017" || tree_name === "APHA-2011-2017") {
        if (radioValue === "circular") {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'circle', 1, 'rgb(0, 255, 0)', 2)
            }
        }
        if (radioValue === "rectangular" || radioValue === "hierarchical" || radioValue === "diagonal") {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'circle', 2, 'rgb(0, 255, 0)', 3)
            }
        }
        if (radioValue === "radial" ) {
            for (i = 0; i < tree.leaves.length; i++) {
                set_leaves(i, 'circle', 0.3, 'rgb(0, 255, 0)', 0.5)
            }
        }
    }

    if (tree_name === "Mix-2017" || tree_name === "APHA-All-Mix") {
        annotate_mix_tree();
    }

    if (tree_name === "") {
        for (i = 0; i < tree.leaves.length; i++) {
            set_leaves(i, 'circle', 3, 'rgb(0, 0, 255)', 5)
        }
    }
});

$('.load').click(function (e) {
    document.getElementById("phylocanvas").hidden = false;

    $('.btn').removeClass('active')
    $('#circular').addClass('active')
   
    tree_textarea = document.getElementById("nwk_input");
    if (e.target.innerHTML.indexOf('PHE') !== -1) {
        load_tree('phe_tree', 'PHE', 'circular');
        for (i = 0; i < tree.leaves.length; i++) {
            set_leaves(i, 'square', 8, 'rgb(255, 0, 0)', 20)
        }
    }
    else if (e.target.innerHTML.indexOf('APHA-2017') !== -1) {
        load_tree('apha_tree', 'APHA-2017', 'circular');
        for (i = 0; i < tree.leaves.length; i++) {
            set_leaves(i, 'circle', 2, 'rgb(0, 255, 0)', 4)
        }
    }
    else if (e.target.innerHTML.indexOf('Mix-2017') !== -1) {
        load_tree('mix_tree', 'Mix-2017', 'circular');
        annotate_mix_tree();
    }
    else if (e.target.innerHTML.indexOf('APHA-2011-2017') !== -1) {
        load_tree('apha_2011_2017', 'APHA-2011-2017', 'circular');
        for (i = 0; i < tree.leaves.length; i++) {
            set_leaves(i, 'circle', 1, 'rgb(0, 255, 0)', 1)
        }
    }
    else if (e.target.innerHTML.indexOf('APHA-All-Mix') !== -1) {
        load_tree('apha_2011_2017_mix', 'APHA-All-Mix', 'circular');
        annotate_mix_tree();
    }
    else if (e.target.innerHTML.indexOf('Tree from Text') !== -1) {
        document.getElementById("phylocanvas").hidden = true;
        document.getElementById("current_tree").innerHTML = "";
        tree_textarea.value = "";
    }

    tree.draw();
    
});

function annotate_mix_tree() {
    for (i = 0; i < tree.leaves.length; i++) {
       
        if (((tree.leaves[i].id.startsWith("R") || tree.leaves[i].id.startsWith("1") || tree.leaves[i].id.startsWith("0") || tree.leaves[i].id.indexOf(".") !== -1) && (tree.leaves[i].id.indexOf("-") === -1)) || tree.leaves[i].id.startsWith("a035ffb7") ) {
            set_leaves(i, 'square', 1, 'rgb(255, 0, 0)', 1)
        } else if (tree.leaves[i].id.startsWith("T") || tree.leaves[i].id.startsWith("C") || tree.leaves[i].id.indexOf("-") !== -1
            || tree.leaves[i].id.startsWith("A") || tree.leaves[i].id.startsWith("60") || tree.leaves[i].id.startsWith("S") ||
            tree.leaves[i].id.startsWith("BTB") || tree.leaves[i].id.startsWith("MR") || tree.leaves[i].id.startsWith("Un") ||
            tree.leaves[i].id.length === 2 || tree.leaves[i].id.length === 3)
        {
            set_leaves(i, 'circle', 1, 'rgb(0, 255, 0)', 1)
        } else {
           set_leaves(i, 'circle', 1, 'rgb(0, 0, 255)', 1)
        }
    }
}

function load_tree(tree_name, tree_title, tree_shape) {
    tree_textarea.value = document.getElementById(tree_name).innerHTML;
    document.getElementById("current_tree").innerHTML = tree_title;
    var tree_input = document.getElementById("nwk_input").value;
    tree.setTreeType(tree_shape);
    tree.load(tree_input);
    
}

function set_leaves(i, shape, nodesize, nodefill, textsize) {
    tree.leaves[i].setDisplay({
        colour: 'black',
        shape: shape, // or square, triangle, star
        size: nodesize, // ratio of the base node size
        leafStyle: {
            strokeStyle: '#0000ff',
            fillStyle: nodefill,
            lineWidth: 1,
        },
        labelStyle: {
            colour: 'black',
            textSize: textsize, // points
            font: 'Arial',
            format: 'bold',
        },
    });
}

window.onload = function setup() {
    document.getElementById("phylocanvas").hidden = true;
}