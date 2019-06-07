# dashflow

![logo](https://github.com/freewheel/dashflow/blob/master/guide_assets/dashflow-header.min.png)

![npm](https://img.shields.io/npm/v/dashflow.svg)

A modern makefile alternative with local dev workflow support and beautiful dashboard.

## What can dashflow do for you

- Replace Makefile using a easy readable dashflow.yml YAML file
- Run many commands in background and collect their stdout/stderr
- Trigger new commands when output from those commands matches certain pattern
- Has a beautiful dashboard which is served by the built-in HTTP server to visualize the status of those commands

![run processes](https://github.com/freewheel/dashflow/blob/master/guide_assets/interactive_shell.min.png)
![web dashboard](https://github.com/freewheel/dashflow/blob/master/guide_assets/web_dashflow.min.png)

## Installation

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed.

```
# install the package
npm install -g dashflow
```

## Usage

```
# print help
$ dashflow --help

# by default read from current folder dashflow.yml
$ dashflow

# support multi config files, config will be merged
$ dashflow -c service1/dashflow.yml -c service2/dashflow.yml

# custom http port
$ dashflow -p 9528

# run with additional debug information
$ DEBUG="app:*" dashflow
$ DEBUG="events:*" dashflow
$ DEBUG="stream:*" dashflow
$ DEBUG="workflow:*" dashflow
$ DEBUG="*" dashflow

# use dashflow shell
dashflow-shell~$ help

  Commands:

    help [command...]          Provides help for a given command.
    exit                       Exits application.
    events [pattern]           Dump events
    emit <event>               Emit a new event
    tail <streamOrWorkflowId>  Tail to a stream or workflow
    attach <streamID>          Attach to a stream
    restart <streamID>         Restart a stream
    env                        Print environment variables

```

## Concepts

Dashflow is modeled around some key concepts.

Please take some time to understand those concepts so you can use this tool effectively.

### Event

An event is just a plain string, associated with its creation time. Usually events will have certain prefixes so that they can easily be distinguished from different sources of events.

For example, here are some sample events:

```
stream:watch-src:watch:add:src/new_file
stream:watch-test:watch:addDir:src/test/
command:lint:shell:yarn --silent lint:stdout:lint passed
workflow:initial-lint:command:lint:shell:yarn --silent lint:stdout:lint passed
```

In dashflow, all events store in memory (which means all events will be lost once the dashflow process exited). 

The default view of events are ordered by their creation time, newer to older.

### Command

A command is an alias for a shell function, commands can be composed together, executing one by one or concurrently.

The following is an example of command configurations:

```
commands:
  // the following concise way of declaring a command is a shortcut for the formal one
  // which is demonstrated with "test" command
  lint: yarn --silent lint
  test:
    shell: { cmd: yarn --silent test --no-color --verbose }
  lint-then-test:
    // run those commands one by one
    serial:
      - lint
      - test
  lint-and-test:
    // run those commands concurrently
    parallel:
      - lint
      - test
  list-web-files:
    // by default we assume shell should executes from the same folder
    // where dashflow.yml file is located
    // but we can specify a sub folder by providing 'cwd' argument to shell
    shell: { cmd: ls, cwd: web }
```

### Stream

A stream is something that will emit events, it can be either a long running process like a web server, or a one off command like running test.

The following is an example of stream configurations:

```
streams:
  watch-lib:
    // listen on current folder for file changes and report evens on matching files
    watch: { glob: "lib/**/*.js" }
  watch-test:
    // can specify a sub folder by providing 'cwd' argument to watch
    watch: { glob: "**/*.js", cwd: test }
  python:
    // can execute a shell command
    shell: { cmd: python -i }
  vim:
    // can specify a sub folder by providing 'cwd' argument to shell
    shell: { cmd: vim, cwd: test }
```

### Workflow

A workflow represents a rule, typically some execution logic like "when A happens, then B then C then D".

A concrete example is that when a file changed in "src" folder, we would like lint and test to be triggered automatically.

A workflow also emit events, from this point of view it is also a special stream.

In dashflow, workflows are always triggered while a new event matches given pattern.

The following is an example of workflow configurations:

```
workflows:
  initial-lint:
    // special event fires when dashflow starts
    match: SYSTEM:started
    command: lint
  initial-test:
    match: SYSTEM:started
    command: test
  lib-lint-then-test:
    match: watch-lib:.*
    // execute those commands serially
    serial:
      - command: lint
      - command: test
  test-lint-then-test:
    match: watch-test:.*
    // execute those commands parallelly
    parallel:
      - command: lint
      - command: test
      - restart: irb
  web-lint:
    match: watch-web:.*
    serial:
      - delay: 1000
      - command: lint
```

### Dashboard

Dashflow starts an HTTP server when running in daemon mode, and what being served is an special page that visualizes all those events dashflow has collected.
The page has many tabs, each tab is a dashboard. A dashboard has many widgets, each occupies a rectangular area. 

Different widget type behaves very differently:

- a "log" widget shows a subset of all events by applying a filter
- a "gauge" widget shows status texts base on calculations on event streams, like "passing/failed/unknown" etc
- a "banner" widget displays static text

For example:

```
dashboards:
  all-in-one:
    - log:
        position: 0 0 45% 50%
        title: Lint
        filter: command:lint:.*
    - log:
        position: 45% 0 90% 50%
        title: Test
        filter: command:test:.*
    - banner:
        position: 90% 0 100% 16%
        content: This is Dashflow Dashboard
    - gauge:
        position: 90% 16% 100% 32%
        title: Lint Status
        filter: command:lint:state:.*
        scan:
          when:
            - pattern: started
              text: Running
              color: yellow
            - pattern: exited with 0
              text: Passed
              color: green
            - pattern: exited with
              text: Failed
              color: red
          default:
            text: Unknown
```

## Configuration

A dashflow.yml is required in order to utilize dashflow as a local development workflow orchestrator.

Basically what we need to do is to model the workflow we already have into those concepts in dashflow.

Here're some example configurations for your inspiration.

### dashflow.yml for a frontend project

```
commands:
  lint: yarn --silent lint_min
  test: yarn --silent test_min

streams:
  site: { shell: { cmd: yarn --silent site } }
  watch-src: { watch: { glob: "src/**/*.js*" } }

workflows:
  initial-lint:
    match: SYSTEM:started
    command: lint
  initial-test:
    match: SYSTEM:started
    command: test
  on-src-update: |
    match: watch-src:.*
    parallel:
      - command: lint
      - command: test

dashboards:
  spark-ui:
    - log:
        position: 0 0 90% 50%
        title: Webpack Logs
        filter: stream:site:.*
    - gauge:
        position: 90% 0 100% 25%
        title: Lint Status
        filter: command:lint:state:.*
        scan:
          when:
            - pattern: started
              text: Running
              color: yellow
            - pattern: exited with 0
              text: Passed
              color: green
            - pattern: exited with
              text: Failed
              color: red
          default:
            text: Unknown
    - gauge:
        position: 90% 25% 100% 50%
        title: Test Status
        filter: command:test:state:.*
        scan:
          when:
            - pattern: started
              text: Running
              color: yellow
            - pattern: exited with 0
              text: Passed
              color: green
            - pattern: exited with
              text: Failed
              color: red
          default:
            text: Unknown
    - log:
        position: 0 50% 50% 100%
        title: Lint
        filter: command:lint:.*
    - log:
        position: 50% 50% 100% 100%
        title: Test
        filter: command:test:.*
```

### dashflow.yml for dashflow project itself

Click [here](./dashflow.yml)

## Reference

commandID/streamID/workflowID is the key of a command/stream/workflow definition in the configuration file.

### Command

```
# execute shell command
commandID:
  shell:
    cmd: <shell command>
    cwd: "working folder, default to be where dashflow.yml is located"
# produces events in following formats
#   command:commandID:shell:<shell command>:stdout:<shell stdout>
#   command:commandID:shell:<shell command>:state:started
#   command:commandID:shell:<shell command>:state:exited with <shell exit code>
```

### Stream

```
# listen on file changes
streamID:
  watch: 
    glob: <glob pattern>
    cwd: "working folder, default to be where dashflow.yml is located"
# produces events in following formats
#   stream:streamID:watch:add:<file path>
#   stream:streamID:watch:addDir:<file path>
#   stream:streamID:watch:change:<file path>
#   stream:streamID:watch:unlink:<file path>
#   stream:streamID:watch:unlinkDir:<file path>

# execute shell command
streamID:
  shell:
    cmd: <shell command>
    cwd: "working folder, default to be where dashflow.yml is located"
# short form for the above if cwd is default
streamID: <shell command>
# produces events in following formats
#   stream:streamID:shell:<shell command>:stdout:<shell stdout>
#   stream:streamID:shell:<shell command>:state:started
#   stream:streamID:shell:<shell command>:state:exited with <shell exit code>
```

### Workflow

```
# execute command if there's a match
workflowID:
  match: "event pattern that triggers this workflow"
  command: "command name to trigger"
# produces events in following formats
#   workflow:workflowID:<command event format here>

# restart stream if there's a match
workflowID:
  match: "event pattern that triggers this workflow"
  restart: <streamID>
# produces events in following formats
#   workflow:workflowID:restart:<streamID>

# wait for a certain time if there's a match
# usually used together with serial command
workflowID:
  match: "event pattern that triggers this workflow"
  wait: <time in milliseconds>
# produces no events

# run workflow actions serially
workflowID:
  match: "event pattern that triggers this workflow"
  serial: 
    - command: <cmd1>
    - wait: 1000
    - command: <cmd2>

# run workflow actions parallelly
workflowID:
  match: "event pattern that triggers this workflow"
  parallel: 
    - command: <cmd1>
    - command: <cmd2>
```

### Dashboard

```
# show a subset of all event streams by applying a filter
dashboardID:
  - log:
      position: <rectangular: x1 y1 x2 y2>
      title: <title string>
      filter: <filter pattern>

# show a console log with a header gauge
dashboardID:
  - log:
      position: <rectangular: x1 y1 x2 y2>
      title: <title string>
      filter: <log filter pattern>
      gauge:
        filter: <gauge filter pattern>
        scan:
          when:
            - pattern: started
              text: Running
              color: yellow
            - pattern: exited with 0
              text: Passed
              color: green
            - pattern: exited with
              text: Failed
              color: red
          default:
            text: Unknown

# show status text by running some calculations
dashboardID:
  - gauge:
      position: <rectangular: x1 y1 x2 y2>
      title: <title string>
      filter: <filter pattern>
      scan:
        when:
          - pattern: <pattern 1>
            text: <status text 1>
            color: <status color: green|yellow|red>
          - pattern: <pattern 2>
            text: <status text 2>
            color: <status color: green|yellow|red>
        default:
          text: <default text>
          color: <default color, default: grey>

# display static content
dashboardID:
  - banner:
      position: <rectangular: x1 y1 x2 y2>
      content: <static content string>
```

## Acknowledgement

Dashflow was initially built by engineers @ [FreeWheel, a Comcast company](https://freewheel.tv/), and donated to the open source community.
