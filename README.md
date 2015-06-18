# Akka Message Visualization

Simple extension to Akka producing logs which would be used to extract some useful data using logstash.

## Running example project

Simply call:

    $ sbt testapp/run
    
## Requirements

We need to configure project to make use of our small library. Enable extension in `application.conf`:

    akka {
      extensions = ["io.scalac.amv.extension.MessagingLogger"]
    }

and make sure that logging format in `logback.xml` follow the defined pattern:

    <configuration>
      ...
      <appender name="SomeName" class=...>
        <encoder>
          <pattern>[%-5level] %date{ISO8601} - %msg%n</pattern>
        </encoder>
        ...
      </appender>
      ...
      <logger name="io.scalac.amv.extension" level="DEBUG">
        <appender-ref ref="SomeName" />
      </logger>
      ...
    </configuration>

Next requirement to track messaging with Akka system is usage of `ActorMonitor` trait:

    import io.scalac.amv.monitor.ActorMonitor

    class MyActor extends Actor with ActorMonitor

To track incoming messages prepend `receive` body with `monitorIncoming orElse`:
 
    def receive = monitorIncoming orElse {
      case MessageType1 => ...
      case MessageType2 => ...
      ...
    }
    
To track outgoing messages prepend message sending with `monitorOutgoing -> `:

    monitorOutgoing -> sender() ! ResponseMessage
    
So fully tracked Actor looks like this:

    import io.scalac.amv.monitor.ActorMonitor
    
    class MyActor extends Actor with ActorMonitor {
      def receive = monitorIncoming orElse {
        case Message =>
          monitorOutgoing -> sender() ! Response
      }
    }

## Parsing logs with logstash

For parsing logs with logstash we need to have logstash installed and we need to feed it with configuration. Example can
be found in a `logstash-conf/process-message-logs.conf` file. Unfortunately logstash has several limitations e.g.

 * one config cannot reference other configurations,
 * variables or parameters cannot be passed into configs via command line,
 * and via environment variables either.
 
Because of that configs can only use absolute paths, so it is necessary to edit example config before one can run it
(namely, the absolute path to the observed logs has to be set). Once configured we could start logstash process like
that:

    $ cd akka-message-visualization
    $ logstash -f logstash-conf/process-message-logs.conf

Alternatively, we can pass configuration via command line and utilize its features to set the absolute path: 

    $ cd akka-message-visualization
    $ read -d '' logstash_config <<- CONFIG
      # Read all .log files with names staring with "monitor"
      input { file { path => "$PWD/logs/monitor*.log" } }
      
      # Match log output
      filter {
        grok {
          match => [
            "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Msg Received: %{NOTSPACE:receiver_class}:%{NUMBER:receiver_hash} <- %{NOTSPACE:message_class}:%{NUMBER:message_hash}",
            "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Msg Sent: %{NOTSPACE:sender_class}:%{NUMBER:sender_hash} -> %{NOTSPACE:message_class}:%{NUMBER:message_hash}"
          ]
        }
        mutate {
          remove_field => ["message","@version","@timestamp","host","path","_grokparsefailure"]
        }
      }
      
      # Output results
      output { stdout { codec => json_lines } }
    CONFIG
    $ logstash -e $logstash_config

Once we'll see `Logstash startup completed` message we'll know that logstash started observing `log/` directory for
changes in `monitor*.log` files. Then we can run our test application in another terminal and let logstash do its work
in the background. Hopefully we'll get something like:
 
    Logstash startup completed
    {"time":"2015-06-18T12:29:07,658Z","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"425079042","message_class":"io.scalac.amv.testapp.PingActor$Initialize$","message_hash":"-1430411344"}
    {"time":"2015-06-18T12:29:07,663Z","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"425079042","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,664Z","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"161412293","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,665Z","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"161412293","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-18T12:29:07,666Z","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"425079042","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-18T12:29:07,666Z","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"425079042","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,667Z","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"161412293","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,667Z","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"161412293","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-18T12:29:07,667Z","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"425079042","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-18T12:29:07,667Z","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"425079042","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,668Z","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"161412293","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-18T12:29:07,668Z","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"161412293","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-18T12:29:07,668Z","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"425079042","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}

Result would be JSON objects separated by new lines.

## Visualization

Todo: for starter maybe `vis.js` for displaying graph. 
