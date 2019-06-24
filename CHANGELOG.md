# 2019-06-18

- improved error handling

# 2019-06-17

- updated dashboard look and feel

# 2019-06-07

- added option for log with gauge

# 2019-05-23

- updated favicon and logo

# 2019-04-21

- fixed interactive shell bug

# 2019-04-20

- added `run` commands for interative mode

# 2019-04-19

- supported automatic port allocation

# 2019-04-16

- fixed workflow parallel provider not triggering bug
- fixed workflow command missing state:started event

# 2019-04-12

- suppressed stream exit promise error

# 2019-03-11

- redesigned dashflow.yml syntax

# 2018-10-05

- added support for `delay` command to workflow

# 2018-07-31

- fixed stream shell command bug when command contains double quotes

# 2018-07-19

- change web UI font
- support $FILENAME environment variable in workflow shell function

# 2018-07-06

- refactor to provide a more usable API interface

# 2018-07-02

- improved web UI configuration error handling
- removed package dependency on execa
- added command autocomplete for interactive shell
- support environment variable prefix in shell command
- fixed workflow triggering order problem

# 2018-06-30

- added "config" command to interactive shell to dump config info

# 2018-06-29

- improved config file validation for streams/workflows
- improved web UI to support graceful backend switch from one project to the other
- added live config editing support

# 2018-06-27

- improved stream child process cleanup
- added update notifier
- improved shell output events, being more granular with additional state events
- changed system dashboard to show latest events
- refined web UI display

# 2018-06-26

- added gauge function for dashboard
