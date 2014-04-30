document.getElementById('version-selector').addEventListener('change', selectVersion);  


function selectVersion(){
    console.log(this.options[this.selectedIndex].value);
    renderCircleGraph("/wordpress/circle_developer_comment_" + this.options[this.selectedIndex].value + ".json","developer-comment",100);
    renderCircleGraph("/wordpress/circle_developer_commit_" + this.options[this.selectedIndex].value + ".json","developer-commit",100);
    renderCircleGraph("/wordpress/circle_developer_work_" + this.options[this.selectedIndex].value + ".json","developer-work",100);

    //renderCircleGraph("/wordpress/circle_file_logic_" + this.options[this.selectedIndex].value + ".json","file-logic",10);
    //renderCircleGraph("/wordpress/circle_file_syntax_" + this.options[this.selectedIndex].value + ".json","file-syntax",10);
    //renderCircleGraph("/wordpress/circle_file_work_" + this.options[this.selectedIndex].value + ".json","file-work",10);

    renderCircleGraph("/wordpress/circle_TT_logic_" + this.options[this.selectedIndex].value + ".json","TT-logic",250);
    renderCircleGraph("/wordpress/circle_TT_syntax_" + this.options[this.selectedIndex].value + ".json","TT-syntax",150);
    renderCircleGraph("/wordpress/circle_TT_work_" + this.options[this.selectedIndex].value + ".json","TT-work",100);
};

var highlighted = null;

function highlightObject(obj) {
    if (obj) {
        if (obj !== highlighted) {
            graph.node.classed('inactive', function(d) {
                return (obj !== d
                     && d.depends.indexOf(obj.name) == -1
                     && d.dependedOnBy.indexOf(obj.name) == -1);
            });
            graph.line.classed('inactive', function(d) {
                return (obj !== d.source && obj !== d.target);
            });
        }
        highlighted = obj;
    } else {
        if (highlighted) {
            graph.node.classed('inactive', false);
            graph.line.classed('inactive', false);
        }
        highlighted = null;
    }
}

function deselectObject(doResize) {
    if (doResize || typeof doResize == 'undefined') {
        resize(false);
    }
    graph.node.classed('selected', false);
    selected = {};
    highlightObject(null);
}

function selectObject(obj, el) {
    var node;
    if (el) {
        node = d3.select(el);
    } else {
        graph.node.each(function(d) {
            if (d === obj) {
                node = d3.select(el = this);
            }
        });
    }
    if (!node) return;

    if (node.classed('selected')) {
        deselectObject();
        return;
    }
    deselectObject(false);

    selected = {
        obj : obj,
        el  : el
    };

    highlightObject(obj);

    node.classed('selected', true);
    //$('#docs').html(obj.docs);
    //$('#docs-container').scrollTop(0);
    resize(true);

    var $graph   = $('#graph'),
        nodeRect = {
            left   : obj.x + obj.extent.left + graph.margin.left,
            top    : obj.y + obj.extent.top  + graph.margin.top,
            width  : obj.extent.right  - obj.extent.left,
            height : obj.extent.bottom - obj.extent.top
        },
        graphRect = {
            left   : $graph.scrollLeft(),
            top    : $graph.scrollTop(),
            width  : $graph.width(),
            height : $graph.height()
        };
    if (nodeRect.left < graphRect.left ||
        nodeRect.top  < graphRect.top  ||
        nodeRect.left + nodeRect.width  > graphRect.left + graphRect.width ||
        nodeRect.top  + nodeRect.height > graphRect.top  + graphRect.height) {

        $graph.animate({
            scrollLeft : nodeRect.left + nodeRect.width  / 2 - graphRect.width  / 2,
            scrollTop  : nodeRect.top  + nodeRect.height / 2 - graphRect.height / 2
        }, 500);
    }
}

var renderMainGraph = function( jsonFile, divId, distance){

    var width = 1000,
        height = 800;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-300)
        .linkDistance(distance)
        .size([width, height]);

    /*clear the graph out*/
    d3.select(document.getElementById(divId)).html("<label>"+divId+"-netwrok</label>");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);


    d3.json(jsonFile, function(error, graph) {
        force
            .nodes(graph.nodes)
            .links(graph.links)
            //.text(graph.nodes)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .on('mouseover', function(d) {
                if (!selected.obj) {
                    if (graph.mouseoutTimeout) {
                        clearTimeout(graph.mouseoutTimeout);
                        graph.mouseoutTimeout = null;
                    }
                    highlightObject(d);
                }
            })
            .on('mouseout', function() {
                if (!selected.obj) {
                    if (graph.mouseoutTimeout) {
                        clearTimeout(graph.mouseoutTimeout);
                        graph.mouseoutTimeout = null;
                    }
                    graph.mouseoutTimeout = setTimeout(function() {
                        highlightObject(null);
                    }, 300);
                }
            })
            .call(force.drag);

        // node.append("title")
        //     .text(function(d) { return d.name; });

        // var g = svg.selectAll("g")
        //     .data(graph.nodes)
        //     .enter().append('text')
        //     .text(function(d) {
        //         return d.name;
        //     });
        var text = svg.selectAll(".text")
            .data(graph.nodes)
            .enter().append("text")
            .style("fill", function(d) { return color(d.group); })
            .text(function(d) { return d.name ; })
            .on("click", function(d){ console.log(d.name); alert(d.name + 
                "Degree Centrality:"+500*Math.random()+
                "; Closeness Centrality:"+100*Math.random()+
                "; Betweeness Centrality:"+1000*Math.random());})
            .call(force.drag);


        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
            
        });
    });

    d3.select(".text")
        .on("click", function() {
            console.log(this.value);
        });

}


var renderCircleGraph = function( jsonFile, divId, distance){

    var width = 500,
        height = 500;

    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(distance)
        .size([width, height]);

    /*clear the graph out*/
    d3.select(document.getElementById(divId)).html("<label>"+divId+"-netwrok</label>");

    var svg = d3.select(document.getElementById(divId)).append("svg")
        .attr("width", width)
        .attr("height", height);


    d3.json(jsonFile, function(error, graph) {
        force
            .nodes(graph.nodes)
            .links(graph.links)
            //.text(graph.nodes)
            .start();

        var link = svg.selectAll(".link")
            .data(graph.links)
            .enter().append("line")
            .attr("class", "link")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("class", "node")
            .attr("r", 5)
            .style("fill", function(d) { return color(d.group); })
            .call(force.drag);

        // node.append("title")
        //     .text(function(d) { return d.name; });

        // var g = svg.selectAll("g")
        //     .data(graph.nodes)
        //     .enter().append('text')
        //     .text(function(d) {
        //         return d.name;
        //     });
        var text = svg.selectAll(".text")
            .data(graph.nodes)
            .enter().append("text")
            .style("fill", function(d) { return color(d.group); })
            .text(function(d) { return d.name ; })
            .on("click", function(d){ console.log(d.name);})
            .call(force.drag);


        force.on("tick", function() {
            link.attr("x1", function(d) { return d.source.x; })
                .attr("y1", function(d) { return d.source.y; })
                .attr("x2", function(d) { return d.target.x; })
                .attr("y2", function(d) { return d.target.y; });

            node.attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });

            text.attr("x", function(d) { return d.x; })
                .attr("y", function(d) { return d.y; });
            
        });
    });

    d3.select(".text")
        .on("click", function() {
            console.log(this.value);
        });

}

var renderLabelGraph = function(jsonFile, divId){
    var w = 500, h = 500;

    var labelDistance = 0;

    var vis = d3.select(document.getElementById(divId)).append("svg:svg").attr("width", w).attr("height", h);

    d3.json(jsonFile, function(error, graph) {

        var force = d3.layout.force().size([w, h]).nodes(graph.nodes).links(graph.links).gravity(1).linkDistance(50).charge(-3000).linkStrength(function(x) {
            return x.weight * 10
        });


        force.start();

        var force2 = d3.layout.force().nodes(graph.labelAnchors).links(graph.labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
        force2.start();

        var link = vis.selectAll("line.link").data(graph.links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");

        var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node");
        node.append("svg:circle").attr("r", 5).style("fill", "#555").style("stroke", "#FFF").style("stroke-width", 3);
        node.call(force.drag);


        var anchorLink = vis.selectAll("line.anchorLink").data(graph.labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

        var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
        anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
            anchorNode.append("svg:text").text(function(d, i) {
            return i % 2 == 0 ? "" : d.node.label
        }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

        var updateLink = function() {
            this.attr("x1", function(d) {
                return d.source.x;
            }).attr("y1", function(d) {
                return d.source.y;
            }).attr("x2", function(d) {
                return d.target.x;
            }).attr("y2", function(d) {
                return d.target.y;
            });

        }

        var updateNode = function() {
            this.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });

        }


        force.on("tick", function() {

            force2.start();

            node.call(updateNode);

            anchorNode.each(function(d, i) {
                if(i % 2 == 0) {
                    d.x = d.node.x;
                    d.y = d.node.y;
                } else {
                    var b = this.childNodes[1].getBBox();

                    var diffX = d.x - d.node.x;
                    var diffY = d.y - d.node.y;

                    var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                    var shiftX = b.width * (diffX - dist) / (dist * 2);
                    shiftX = Math.max(-b.width, Math.min(0, shiftX));
                    var shiftY = 5;
                    this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
                }
            });


            anchorNode.call(updateNode);

            link.call(updateLink);
            anchorLink.call(updateLink);

        });

    });


}


var renderLabelGraphTest = function(jsonFile, divId){
    var w = 500, h = 500;

    var labelDistance = 0;

    var vis = d3.select(document.getElementById(divId)).append("svg:svg").attr("width", w).attr("height", h);

    var nodes = [];
    var labelAnchors = [];
    var labelAnchorLinks = [];
    var links = [];

    for(var i = 0; i < 30; i++) {
        var node = {
            label : "node " + i
        };
        nodes.push(node);
        labelAnchors.push({
            node : node
        });
        labelAnchors.push({
            node : node
        });
    };

    for(var i = 0; i < nodes.length; i++) {
        for(var j = 0; j < i; j++) {
            if(Math.random() > .95)
                links.push({
                    source : i,
                    target : j,
                    weight : Math.random()
                });
        }
        labelAnchorLinks.push({
            source : i * 2,
            target : i * 2 + 1,
            weight : 1
        });
    };



    var force = d3.layout.force().size([w, h]).nodes(nodes).links(links).gravity(1).linkDistance(50).charge(-3000).linkStrength(function(x) {
        return x.weight * 10
    });


    force.start();

    var force2 = d3.layout.force().nodes(labelAnchors).links(labelAnchorLinks).gravity(0).linkDistance(0).linkStrength(8).charge(-100).size([w, h]);
    force2.start();

    var link = vis.selectAll("line.link").data(links).enter().append("svg:line").attr("class", "link").style("stroke", "#CCC");

    var node = vis.selectAll("g.node").data(force.nodes()).enter().append("svg:g").attr("class", "node");
    node.append("svg:circle").attr("r", 5).style("fill", "#555").style("stroke", "#FFF").style("stroke-width", 3);
    node.call(force.drag);


    var anchorLink = vis.selectAll("line.anchorLink").data(labelAnchorLinks)//.enter().append("svg:line").attr("class", "anchorLink").style("stroke", "#999");

    var anchorNode = vis.selectAll("g.anchorNode").data(force2.nodes()).enter().append("svg:g").attr("class", "anchorNode");
    anchorNode.append("svg:circle").attr("r", 0).style("fill", "#FFF");
        anchorNode.append("svg:text").text(function(d, i) {
        return i % 2 == 0 ? "" : d.node.label
    }).style("fill", "#555").style("font-family", "Arial").style("font-size", 12);

    var updateLink = function() {
        this.attr("x1", function(d) {
            return d.source.x;
        }).attr("y1", function(d) {
            return d.source.y;
        }).attr("x2", function(d) {
            return d.target.x;
        }).attr("y2", function(d) {
            return d.target.y;
        });

    }

    var updateNode = function() {
        this.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });

    }


    force.on("tick", function() {

        force2.start();

        node.call(updateNode);

        anchorNode.each(function(d, i) {
            if(i % 2 == 0) {
                d.x = d.node.x;
                d.y = d.node.y;
            } else {
                var b = this.childNodes[1].getBBox();

                var diffX = d.x - d.node.x;
                var diffY = d.y - d.node.y;

                var dist = Math.sqrt(diffX * diffX + diffY * diffY);

                var shiftX = b.width * (diffX - dist) / (dist * 2);
                shiftX = Math.max(-b.width, Math.min(0, shiftX));
                var shiftY = 5;
                this.childNodes[1].setAttribute("transform", "translate(" + shiftX + "," + shiftY + ")");
            }
        });


        anchorNode.call(updateNode);

        link.call(updateLink);
        anchorLink.call(updateLink);

    });
}



var testoutput = function(){
    console.log("test output");
}



