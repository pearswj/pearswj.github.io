var job = "plankton";
var d = [];

$('#listing').html('<pre>Loading...</pre>');

$.getJSON("http://ec2-54-77-171-109.eu-west-1.compute.amazonaws.com/job/plankton/api/json", function (data) {
    var items = [];
    $.each(data.builds.slice(0,50), function(key, value) {
        var line = value.number;
        var build = {};
        build.number = value.number;
        build.jenkins_url = value.url;
    
        $.ajaxSetup({ // async weirdness
          async: false
        });
    
        $.getJSON(value.url + "/api/json", function (build_data) {
            if (build_data.result != "SUCCESS") return true;
            //build.date = build_data.id;
            build.date = new Date(build_data.timestamp).toISOString();
            $.each(build_data.actions, function (i, action) {
              if (action["parameters"]) {
                line = line + " / " + action.parameters[2].value;
                build.ref = action.parameters[2].value;
              }
            
              if (action["buildsByBranchName"]) {
                //line = line + ": " + Object.keys(action.buildsByBranchName).join(", ");
                for (branch in action.buildsByBranchName) {
                branch = action.buildsByBranchName[branch];
                //line = line + ", " + branch['buildNumber'];
                  if (branch.buildNumber == value.number) {
                    line = line + " / <a href='https://github.com/Dan-Piker/Plankton/commit/" + branch.revision.SHA1 + "'>" + branch.revision.SHA1.substring(0,7) + "</a>";
                    build.sha = branch.revision.SHA1;
                    build.sha_short = build.sha.slice(0,7);
                    build.github_url = "https://github.com/Dan-Piker/Plankton/commit/" + build.sha;
                    break;
                  }
                }
              }
            });
            
            var file = job + "-" + value.number + ".zip";
            line = line + " / <a href='http://wjp-builds-data.s3-eu-west-1.amazonaws.com/" + file + "'>" + file + "</a>";
            build.artifact = file;
            build.artifact_url = "http://wjp-builds-data.s3-eu-west-1.amazonaws.com/" + file;
            
            //items.push("<li>" + line + "</li>");
            items.push(build);
        });
    });

  /*$( "<ul/>", {
    "class": "my-new-list",
    html: items.join( "" )
  }).appendTo( "body" );*/
  
  //d = items;
  $('#listing').html('');
  document.getElementById('listing').innerHTML = '<pre>' + prepareTable(items) + '</pre>';
  
  //var div = document.getElementById('listing');
  //div.innerHTML = div.innerHTML + items.join("");
});

// info is object like:
// {
//    files: ..
//    directories: ..
//    prefix: ...
// } 
//
// it should be like:
// [
//   {
//      number: ..
//      ref: ..
//      sha: ..
//      sha_short: ..
//      github_url: ..
//      artifact: ..
//      artifact_url: ..
//   }
// ]
function prepareTable(items) {
  //var files = info.files.concat(info.directories)
  //  , prefix = info.prefix
  //  ;
  var cols = [ 29, 10, 12, 25, 16 ];
  var content = [];
  content.push(padRight('Date', cols[0]) + padRight('Number', cols[1]) + padRight('SHA', cols[2]) + padRight('Artifact', cols[3]) + 'Branch Ref \n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + cols[3] + cols[4] + 4).join('-') + '\n');


  jQuery.each(items, function(idx, item) {
    d.push(item);
    var row = renderRow(item, cols);
    content.push(row + '\n');
  });

  return content.join('');
}

function renderRow(item, cols) {
  var row = '';
  row += padRight(item.date, cols[0]);
  row += padRightUrl(item.number, item.jenkins_url, cols[1]);
  //row += padRight('<a href="' + item.github_url + '">' + item.sha_short + '</a>', cols[2]);
  row += padRightUrl(item.sha_short, item.github_url, cols[2]);
  row += padRightUrl(item.artifact, item.artifact_url, cols[3]);
  row += padRight(item.ref, cols[4]) + '  ';
  return row;
}

function padRight(padString, length) {
  var str = String(padString).slice(0, length-3);
  if (padString.length > str.length) {
    str += '...';
  }
  while (str.length < length) {
    str = str + ' ';
  }
  return str;
}

function padRightUrl(padString, padUrl, length) {
  var str = String(padString).slice(0, length-3);
  if (padString.length > str.length) {
    str += '...';
  }
  var len = str.length;
  str = '<a href="' + padUrl + '">' + str + '</a>'
  while (len < length) {
    str = str + ' ';
    len++;
  }
  //str = '<a href="' + padUrl + '">' + str + '</a>'
  return str;
}