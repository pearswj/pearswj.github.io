---
layout: post
title: Jenkins and Nginx
---

I was having a bit of trouble getting Jenkins running behind nginx without that pesky [_it appears that your reverse proxy set up is broken_][1] error message.

As it turns out, the solution is simple: Lose the trailing slash in the `proxy_pass` statement.

```bash
proxy_pass  http://127.0.0.1:8080/; # bad
proxy_pass  http://127.0.0.1:8080;  # good
```

Thanks to [this comment][2] for this simple fix.

[1]: https://wiki.jenkins-ci.org/display/JENKINS/Jenkins+says+my+reverse+proxy+setup+is+broken
[2]: https://issues.jenkins-ci.org/browse/JENKINS-21989?focusedCommentId=197509&page=com.atlassian.jira.plugin.system.issuetabpanels:comment-tabpanel#comment-197509
