$('#listing').html('<pre>Loading...</pre>');

var repo = "mcneel/compat";
var job = "compat";

var api = "https://api.travis-ci.org/repos/" + repo + "/builds";

var xhr = new XMLHttpRequest();
xhr.open('get', api, false);
xhr.setRequestHeader('User-Agent', 'pearswj.co.uk');
xhr.setRequestHeader('Accept', 'application/vnd.travis-ci.2+json');
xhr.send(null);

var json = JSON.parse(xhr.response);

var max = json.builds.length > 20 ? 20 : json.builds.length;

var items = [];
for (var i = 0; i < max; i++) {
  var item = {};

  var build = json.builds[i]

  if (build.finished_at == null || build.state != "passed") {
    continue;
  }

  item.date = build.finished_at;
  item.number = build.number;
  item.ci_url = 'https://api.travis-ci.org/jobs/' + build.job_ids[0] + '/log.txt?deansi=true';

  var commit = json.commits[i]

  item.sha = commit.sha;
  item.sha_short = item.sha.slice(0,7);
  item.github_url = commit.compare_url;
  item.message = commit.message;

  item.artifact = job + "-" + item.number + ".zip";

  // if build was a tag the artifact will be job-tag.zip
  if (commit.branch == commit.compare_url.split("/").pop()) { // seems to do the trick!
      item.artifact = job + "-" + commit.branch + ".zip";
  }

  item.artifact_url = 'https://s3-eu-west-1.amazonaws.com/erdos/builds/' + job + '/' + item.artifact

  item.ref = commit.branch;
  if (build.pull_request == true) {
    item.ref = '#' + build.pull_request_number;
  }

  items.push(item);
}

  $('#listing').html('');
  document.getElementById('listing').innerHTML = '<pre>' + prepareTable(items) + '</pre>';

// items is object like:
// [
//   {
//      number: ..
//      ref: ..
//      sha: ..
//      sha_short: ..
//      github_url: ..
//      artifact: ..
//      artifact_url: ..
//   },
//   ...
// ]
function prepareTable(items) {
  var cols = [ 29, 10, 12, 25, 16 ];
  var content = [];
  content.push(padRight('Date', cols[0]) + padRight('Number', cols[1]) + padRight('SHA', cols[2]) + padRight('Artifact', cols[3]) + 'Branch\n');
  content.push(new Array(cols[0] + cols[1] + cols[2] + cols[3] + cols[4] + 4).join('-') + '\n');


  jQuery.each(items, function(idx, item) {
    var row = renderRow(item, cols);
    content.push(row + '\n');
  });

  return content.join('');
}

function renderRow(item, cols) {
  var row = '';
  row += padRight(item.date, cols[0]);
  row += padRightUrl(item.number, item.ci_url, cols[1]);
  row += padRightUrl(item.sha_short, item.github_url, cols[2], item.message);
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

function padRightUrl(padString, padUrl, length, title) {
  var str = String(padString).slice(0, length-3);
  if (padString.length > str.length) {
    str += '...';
  }
  var len = str.length;
  if (title) {
    title = ' title="' + title + '" ';
  }
  else {
    title = '';
  }
  str = '<a href="' + padUrl + '"' + title + '>' + str + '</a>'
  while (len < length) {
    str = str + ' ';
    len++;
  }
  return str;
}
