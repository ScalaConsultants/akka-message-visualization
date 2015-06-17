# Akka Message Visualization

Simple extension to Akka producing logs which would be used to extract some useful data using logstash.

## Running example project

Simply call:

    $ sbt testapp/run
    
## Usage in code

First requirement to track messaging with Akka system is usage of `ActorMonitor` trait:

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
