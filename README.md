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

To do: figure it out once format of log output is as intended.
