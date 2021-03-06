define(['backbone','modelRapper','collectionRapper','d3'], function (backbone, modelRapper,collectionRapper,d3) {

/*==========================================================================================*/
/*----------------------------  VUE POUR COLLECTION DE RAPPERS  ----------------------------*/
/*==========================================================================================*/

  var settings = {
    oneRapperWidth: $("#container-module").width()/10,
    slideWidth: $("#container-module").width(),
    nbRappers: 0,
    nbClicsLeft: 0,
    nbClicsRight: 0,
    goodForClick: true
  }

  var RapperListInsults = Backbone.View.extend({
    el:'#module-3',
    events: {
      "click #insults-module": "launchInsultsMode",
      "click #vocabulaire-module": "launchVocMode",
      "click .head-rapper": "showRapperDetails",
      "click #slide-right": "moveGraphHardcoreLeft",
      "click #slide-left": "moveGraphHardcoreRight"
    },
    initialize: function(collection){

      var headRappers = d3.select(this.el).select("#head-rappers");
      var graphHardcore = d3.select(this.el).select("#graph-hardcore");
      var axisMoy = d3.select(this.el).select("#axis-moy");

      var barRappers;

      var axis;
      var moy;
      var textMoy;

      d3.json(this.collection.url, function(error, data) {

        settings.nbRappers = data.length;
        var nbClics = settings.nbRappers / 10;
        settings.nbClicsLeft = parseInt(nbClics);

        var width = settings.nbRappers*settings.oneRapperWidth,
          height = $("#graph-hardcore").height();

        graphHardcore.attr("width", width);
        $('#head-rappers').css("width", width+'px');

        axisMoy.attr("width", settings.slideWidth);
        axisMoy.attr("height", height);

        var yInsults = d3.scale.linear()
          .range([height, 0])
          .domain([0, 150]);

        var yAxis = d3.svg.axis()
          .scale(yInsults)
          .orient("left");

        headRappers.selectAll("div").data(data).enter()
          .append("div")
          .attr("class", function(d,i){return "head-rapper head"+i;})
          .style("left",function(d,i){return (i*settings.oneRapperWidth)+((settings.oneRapperWidth/2)-30)+"px";})
          .on("mouseover", function(d,i){
            d3.selectAll(".head-stat-fill"+i).style("fill", "#e94953");
            d3.select(".head-stat-stroke"+i).attr("stroke", "#e94953");
          })
          .on("mouseleave", function(d,i){
            d3.selectAll(".head-stat-fill"+i).style("fill", "#f0f0f0");
            d3.select(".head-stat-stroke"+i).attr("stroke", "#f0f0f0");
          })
          .each(function(d) {
              d3.select(this).append("div")
                .style("background",function(d){return "url('./img/rapper-min/min-"+d.id+".jpg')";})
                .style("background-position","center center")
                .style("background-repeat","no-repeat")
                .style("background-size","60px 60px");
          });

        axis = axisMoy.append("g")
          .attr('class', 'g-axis')
          .attr('transform', "translate(0, 0)")
          .append("g")
          .attr("class", "y axis")
          .call(yAxis);

        moy = axisMoy.append("g")
            .attr('class', 'moy')
            .append("line");

        barRappers = graphHardcore.append("g")
            .attr('id', 'g-graph')
          .selectAll("g").data(data).enter()
            .append("g")
            .attr("class", "g-rapper")
            .attr("transform", function(d, i) { return "translate("+(i*settings.oneRapperWidth+settings.oneRapperWidth/2)+", 0)"; });

      });
    },
    render: function(){

      if($("#graph-hardcore").is(':not(.rend)')){ 
        var width = settings.nbRappers*settings.oneRapperWidth,
          height = $("#graph-hardcore").height();
        var yInsults = d3.scale.linear()
          .range([height, 0]);
        d3.select(this.el).select("#graph-hardcore")
            .attr("class", "rend");
        d3.select(this.el).select('#g-graph')
            .attr("class", "insults-mod");
        var barRappers = d3.selectAll(".g-rapper");
        d3.json(this.collection.url, function(error, data) {

            yInsults.domain([0, 150]);

            d3.select('.moy').select('line')
              .attr("x1","0")
              .attr("x2", settings.slideWidth-10)
              .attr("y1",height)
              .attr("y2",height)
              .transition()
              .duration(500)
              .ease("out")
              .attr("y1", (yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))
              .attr("y2", (yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)));

            d3.select(".moy").append("text")
              .attr("class","lMoy")
              .text("MOYENNE")
              .attr("dx",settings.slideWidth)
              .attr("dy",height)
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", ((yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))-5);

            d3.select(".moy").append("text")
              .attr("class","vMoy")
              .text("("+(Math.round(d3.sum(data, function(d) { return d.insults; })/data.length))+")")
              .attr("dx",settings.slideWidth)
              .attr("dy",height+15)
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", ((yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))+15);

            barRappers.append("rect")
              .attr("class",function(d,i){return "graph-lines head-stat-fill"+i;})
              .attr("width", "1px")
              .attr("y", height )
              .attr("height", "0px")
              .transition()
              .duration(500)
              .ease("out")
              .delay(function(d,i) { return 50*i; })
              .attr("y", function(d) { return yInsults(d.insults); })
              .attr("height", function(d) { return height - yInsults(d.insults); });

            barRappers.append("circle")
              .attr("class", function(d,i){return "graph-circles head-stat-stroke"+i;})
              .attr("r",15)
              .attr("stroke","#f0f0f0") 
              .attr("stroke-width","1")
              .attr("cy", height-15)
              .transition()
              .duration(500)
              .ease("out")
              .delay(function(d, i) { return 50*i; })
              .attr("cy", function(d) { return yInsults(d.insults)-15; });

            barRappers.append("text")
             .attr("class", function(d,i){return "graph-text head-stat-fill"+i;})
             .attr("dy", height-12)
             .transition()
             .duration(500)
             .ease("out")
             .delay(function(d, i) { return 50*i; })
             .attr("dy", function(d) { return yInsults(d.insults)-12;})
             .text(0)
             .transition()
             .duration(1000)
             .ease("cubic-in-out")
             .tween("text", function(d) {
                    var i = d3.interpolate(this.textContent, d.insults),
                        prec = (d.insults + "").split("."),
                        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                    return function(t) {
                        this.textContent = Math.round(i(t) * round) / round;
                    };
                });

        });
      }
    },
    launchInsultsMode: function(){
      if($('#g-graph').attr('class')=='vocabulaire-mod'){

        $("#infos-hardcore-insults .infos-card").attr('class','infos-card');
        $("#infos-hardcore-insults #rapper-card").attr('class', '');

        $('#insults-module').attr('class','active');
        $('#vocabulaire-module').attr('class','');
        $('#g-graph').attr('class','insults-mod');
        $('#infos-hardcore-vocab').attr('class','inactive-infos');
        setTimeout(function(){
          $('#infos-hardcore-insults').attr('class','');
        },500);

        var width = settings.nbRappers*settings.oneRapperWidth,
          height = $("#graph-hardcore").height();

        var yInsults = d3.scale.linear()
          .range([height, 0]);
        var yVocab = d3.scale.linear()
          .range([height, 0]);
        var yAxis = d3.svg.axis()
          .scale(yInsults)
          .orient("left");
        var barRappers = d3.selectAll(".g-rapper");


        d3.json(this.collection.url, function(error, data) {

            yInsults.domain([0, 150]);
            yVocab.domain([1000, 2000]);

            d3.select('.g-axis').select('.axis')
              .call(yAxis);
            

            d3.select('.moy').select('line')
              .attr("y1",yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length))
              .attr("y2",yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length))
              .transition()
              .duration(500)
              .ease("out")
              .attr("y1", (yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))
              .attr("y2", (yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)));

            d3.select(".moy").select(".lMoy")
              .attr("dx",settings.slideWidth)
              .attr("dy",yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length))
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", ((yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))-5);

            d3.select(".moy").select(".vMoy")
              .text("("+(Math.round(d3.sum(data, function(d) { return d.insults; })/data.length))+")")
              .attr("dx",settings.slideWidth)
              .attr("dy",yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length)+15)
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", ((yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))+15);

            barRappers.select("rect")
              .attr("y", function(d) { return yVocab(d.vocabulaire); })
              .attr("height", function(d) { return height - yVocab(d.vocabulaire); })
              .transition()
              .duration(500)
              .ease("out")
              .attr("y", function(d) { return yInsults(d.insults); })
              .attr("height", function(d) { return height - yInsults(d.insults); });

            barRappers.select("circle")
              .attr("cy", function(d) { return yVocab(d.vocabulaire)-15; })
              .transition()
              .duration(500)
              .ease("out")
              .attr("cy", function(d) { return yInsults(d.insults)-15; });

            barRappers.select("text")
             .attr("dy", function(d) { return yVocab(d.vocabulaire)-12;})
             .text(function(d) { return d.vocabulaire; })
             .transition()
             .duration(500)
             .ease("out")
             .attr("dy", function(d) { return yInsults(d.insults)-12;})
             .tween("text", function(d) {
                    var i = d3.interpolate(this.textContent, d.insults),
                        prec = (d.insults + "").split("."),
                        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                    return function(t) {
                        this.textContent = Math.round(i(t) * round) / round;
                    };
                });

        });
      }
    },
    launchVocMode: function(){
      if($('#g-graph').attr('class')=='insults-mod'){

        $("#infos-hardcore-vocab .infos-card").attr('class','infos-card');
        $("#infos-hardcore-vocab #rapper-card").attr('class', '');

        $('#insults-module').attr('class','');
        $('#vocabulaire-module').attr('class','active');
        $('#g-graph').attr('class','vocabulaire-mod');
        $('#infos-hardcore-insults').attr('class','inactive-infos');
        setTimeout(function(){
          $('#infos-hardcore-vocab').attr('class','');
        },500);

        var width = settings.nbRappers*settings.oneRapperWidth,
          height = $("#graph-hardcore").height();

        var yInsults = d3.scale.linear()
          .range([height, 0]);
        var yVocab = d3.scale.linear()
          .range([height, 0]);
        var yAxis = d3.svg.axis()
          .scale(yVocab)
          .orient("left");
        var barRappers = d3.selectAll(".g-rapper");


        d3.json(this.collection.url, function(error, data) {

            yInsults.domain([0, 150]);
            yVocab.domain([1000, 2000]);

            d3.select('.g-axis').select('.axis')
              .call(yAxis);
            
            d3.select('.moy').select('line')
              .attr("y1",(yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))
              .attr("y2",(yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)))
              .transition()
              .duration(500)
              .ease("out")
              .attr("y1", (yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length)))
              .attr("y2", (yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length)));


            d3.select(".moy").select(".lMoy")
              .attr("dx",settings.slideWidth)
              .attr("dy",yInsults(d3.sum(data, function(d) { return d.insults; })/data.length))
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length)-5);

            d3.select(".moy").select(".vMoy")
              .text("("+(Math.round(d3.sum(data, function(d) { return d.vocabulaire; })/data.length))+")")
              .attr("dx",settings.slideWidth)
              .attr("dy",yInsults(d3.sum(data, function(d) { return d.insults; })/data.length)+15)
              .transition()
              .duration(500)
              .ease("out")
              .attr("dy", ((yVocab(d3.sum(data, function(d) { return d.vocabulaire; })/data.length)))+15);

            barRappers.select("rect")
              .attr("y", function(d) { return yInsults(d.insults); })
              .attr("height", function(d) { return height - yInsults(d.insults); })
              .transition()
              .duration(500)
              .ease("out")
              .attr("y", function(d) { return yVocab(d.vocabulaire); })
              .attr("height", function(d) { return height - yVocab(d.vocabulaire); });

            barRappers.select("circle")
              .attr("cy", function(d) { return yInsults(d.insults)-15; })
              .transition()
              .duration(500)
              .ease("out")
              .attr("cy", function(d) { return yVocab(d.vocabulaire)-15; });

            barRappers.select("text")
             .attr("dy", function(d) { return yInsults(d.insults)-12;})
             .text(function(d) { return d.insults; })
             .transition()
             .duration(500)
             .ease("out")
             .attr("dy", function(d) { return yVocab(d.vocabulaire)-12;})
             .tween("text", function(d) {
                    var i = d3.interpolate(this.textContent, d.vocabulaire),
                        prec = (d.vocabulaire + "").split("."),
                        round = (prec.length > 1) ? Math.pow(10, prec[1].length) : 1;
                    return function(t) {
                        this.textContent = Math.round(i(t) * round) / round;
                    };
                });

        });
      }
    },
    showRapperDetails: function(event){
      var target = event.target;
      var stringBase ="head-rapper head";
      var targetClass=$(target).parent().attr('class');
      var targetPos = parseInt(targetClass.substring(stringBase.length, targetClass.length));
      var rapperCardInsults = d3.select('#infos-hardcore-insults').select('#rapper-card');
      var rapperCardVocab = d3.select('#infos-hardcore-vocab').select('#rapper-card');
      if($("#g-graph").attr('class')=="insults-mod"){
        $("#infos-hardcore-insults .infos-card").attr('class','infos-card infos-inactive');
        $("#infos-hardcore-insults #rapper-card").attr('class', 'active-card');
        $("#infos-hardcore-vocab .infos-card").attr('class','infos-card');
        $("#infos-hardcore-vocab #rapper-card").attr('class', '');
        d3.json(this.collection.url, function(error, data) {
            rapperCardInsults.select(".head-card")
                .style('background-image','url(./img/rapper-min/min-'+data[targetPos].id+'.jpg)')
                .style("background-size","64px 64px");
            rapperCardInsults.select("h4")
                .text(data[targetPos].blazz);
            rapperCardInsults.select("a")
                .attr("href", "./#2/"+data[targetPos].blazz);
            rapperCardInsults.select(".album").select("span")
                .text(data[targetPos].album[data[targetPos].v1-1].a_name);
            rapperCardInsults.select(".nb").select("span")
                .text(data[targetPos].insults);
        });
      }else{
        $("#infos-hardcore-vocab .infos-card").attr('class','infos-card infos-inactive');
        $("#infos-hardcore-vocab #rapper-card").attr('class', 'active-card');
        $("#infos-hardcore-insults .infos-card").attr('class','infos-card');
        $("#infos-hardcore-insults #rapper-card").attr('class', '');
        d3.json(this.collection.url, function(error, data) {
            rapperCardVocab.select(".head-card")
                .style('background-image','url(./img/rapper-min/min-'+data[targetPos].id+'.jpg)');
            rapperCardVocab.select("h4")
                .text(data[targetPos].blazz);
            rapperCardVocab.select("a")
                .attr("href", "./#2/"+data[targetPos].blazz);
            rapperCardVocab.select(".album").select("span")
                .text(data[targetPos].album[data[targetPos].v1-1].a_name);
            rapperCardVocab.select(".nb").select("span")
                .text(data[targetPos].vocabulaire);
        });
      }
    },
    moveGraphHardcoreLeft: function(event){
      // on vérifie que le bouton est clickable
      if(settings.goodForClick == true){
        // plus les rappers sont nombreux => plus la largeur est grande => plus il y aura à slider => plus le nombre de click sera important
        // s'il est à 0, il n'est donc plus possible de slider dans ce sens là
        if(settings.nbClicsLeft>0){
          //  dès qu'on click, les boutons ne sont alors plus clickable durant 1s, le temps que le slide se fasse
          settings.goodForClick = false;

          settings.nbClicsLeft -= 1;
          settings.nbClicsRight += 1;

          // on fait le slide
          $('#graph-hardcore').css("left", $('#graph-hardcore').position().left-settings.slideWidth);
          $('#head-rappers').css("left", $('#head-rappers').position().left-settings.slideWidth);

          // on attend 1s, le temps que l'animation se fasse, pour rendre de nouveau clickable les boutons
          setTimeout(function() {
                settings.goodForClick = true;
          }, 1000);
        }
      }
    },
    moveGraphHardcoreRight: function(event){
      if(settings.goodForClick == true){
        if(settings.nbClicsRight>0){
          settings.goodForClick = false;

          settings.nbClicsLeft += 1;
          settings.nbClicsRight -= 1;

          $('#graph-hardcore').css("left", $('#graph-hardcore').position().left+settings.slideWidth);
          $('#head-rappers').css("left", $('#head-rappers').position().left+settings.slideWidth);

          setTimeout(function() {
                settings.goodForClick = true;
          }, 1000);
        }
      }
    }
  });
  return RapperListInsults;
 });