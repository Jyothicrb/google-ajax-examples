function drawVisualization() {
  // Some raw data (not necessarily accurate)
  var rowData = [['Month', 'Bolivia', 'Ecuador', 'Madagascar', 'Papua  Guinea',
                  'Rwanda', 'Average'],
                 ['2004/05', 165, 938, 522, 998, 450, 614.6],
                 ['2005/06', 135, 1120, 599, 1268, 288, 682],
                 ['2006/07', 157, 1167, 587, 807, 397, 623],
                 ['2007/08', 139, 1110, 615, 968, 215, 609.4],
                 ['2008/09', 136, 691, 629, 1026, 366, 569.6]];

  // Create and populate the data table.
  var data = google.visualization.arrayToDataTable(rowData);

  // Create and draw the visualization.
  var ac = new google.visualization.ComboChart(document.getElementById('visualization'));
  ac.draw(data, {
    title : 'Monthly Coffee Production by Country',
    width: 600,
    height: 400,
    vAxis: {title: "Cups"},
    hAxis: {title: "Month"},
    seriesType: "bars",
    series: {5: {type: "line"}}
  });
}