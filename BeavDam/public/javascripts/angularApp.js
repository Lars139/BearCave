var app = angular.module('voltDashboard', ['ui.router']);

app.config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider){
    $stateProvider
     .state('index', {
      url: '/index',
      templateUrl: '/index.html',
      controller: 'voltDashCtrl'
     });

  $urlRouterProvider.otherwise('index');

}]);


app.factory('voltSer', [function(){
  var ret = {
    volt : 0, 
    voltList : [ //no using for anything just for the exmaple
      {count: '1600', volt: 2}, 
      {count: '1601', volt: 4}, 
      {count: '1602', volt: 6}, 
      {count: '1603', volt: 8} 
    ]
  };

  ret.preFetch = function() {
    return $http.get('/voltTTN').success( function(data){
      angular.copy(data, ret.volt);
    });
  }

  return ret;
}]);


app.factory('msgTTNSer', [function(){
  var ret = { };
  ret.preFetch = function() {
    return $http.get('/msgTTN').success( function(data){
      angular.copy(data, ret);
    });
  }
  return ret;
}]);



app.controller('voltDashCtrl', [ '$scope', 'voltSer', 'msgTTNSer',
  function($scope, voltSer, msgTTNSer ) { 

$scope.volt = voltSer.volt;
$scope.voltList = voltSer.voltList;
$scope.msgTTN = msgTTNSer;

$scope.appendVolt = function(){
  $scope.voltList.push({count: '9', volt: $scope.volt});
}

var width = 960,
    height = 800,
    radius = Math.min(width, height) / 1.9,
    spacing = .09;

var formatSecond = d3.time.format("%-S seconds"),
    formatMinute = d3.time.format("%-M minutes"),
    formatHour = d3.time.format("%-H hours"),
    formatDay = d3.time.format("%A"),
    formatDate = function(d) { d = d.getDate(); switch (10 <= d && d <= 19 ? 10 : d % 10) { case 1: d += "st"; break; case 2: d += "nd"; break; case 3: d += "rd"; break; default: d += "th"; break; } return d; },
    formatMonth = d3.time.format("%B");

var textVolt = function(x) { return x+" volts" };


var color = d3.scale.linear()
    .range(["hsl(-180,60%,50%)", "hsl(180,60%,50%)"])
    .interpolate(function(a, b) { var i = d3.interpolateString(a, b); return function(t) { return d3.hsl(i(t)); }; });

var arcBody = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return d.index * radius; })
    .outerRadius(function(d) { return (d.index + spacing) * radius; })
    .cornerRadius(6);

var arcCenter = d3.svg.arc()
    .startAngle(0)
    .endAngle(function(d) { return d.value * 2 * Math.PI; })
    .innerRadius(function(d) { return (d.index + spacing / 2) * radius; })
    .outerRadius(function(d) { return (d.index + spacing / 2) * radius; });

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var field = svg.selectAll("g")
    .data(fields)
  .enter().append("g");

field.append("path")
    .attr("class", "arc-body");

field.append("path")
    .attr("id", function(d, i) { return "arc-center-" + i; })
    .attr("class", "arc-center");

field.append("text")
    .attr("dy", ".35em")
    .attr("dx", ".75em")
    .style("text-anchor", "start")
  .append("textPath")
    .attr("startOffset", "50%")
    .attr("class", "arc-text")
    .attr("xlink:href", function(d, i) { return "#arc-center-" + i; });

tick();

d3.select(self.frameElement).style("height", height + "px");

function tick() {
  if (!document.hidden) field
      .each(function(d) { this._value = d.value; })
      .data(fields)
      .each(function(d) { d.previousValue = this._value; })
    .transition()
      .ease("elastic")
      .duration(500)
      .each(fieldTransition);

  setTimeout(tick, 1000 - Date.now() % 1000);
}

function fieldTransition() {
  var field = d3.select(this).transition();

  field.select(".arc-body")
      .attrTween("d", arcTween(arcBody))
      .style("fill", function(d) { return color(d.value); });

  field.select(".arc-center")
      .attrTween("d", arcTween(arcCenter));

  field.select(".arc-text")
      .text(function(d) { return d.text; });
}

function arcTween(arc) {
  return function(d) {
    var i = d3.interpolateNumber(d.previousValue, d.value);
    return function(t) {
      d.value = i(t);
      return arc(d);
    };
  };
}

function fields() {
  var now = new Date;
  return [

    {index: .3, text: textVolt(voltSer.volt), value: voltSer.volt / 255.001},
    {index: .5, text: formatSecond(now), value: now.getSeconds() / 60},
    {index: .7, text: textVolt(255), value: 255 / 255.001}

  ];
}



}]);
