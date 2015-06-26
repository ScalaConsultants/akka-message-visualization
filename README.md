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
          <pattern>[%-5level] %date{"yyyy-MM-dd'T'HH:mm:ss.SSSXXX", UTC} - %msg%n</pattern>
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
    $ source ./logstash-conf/set_logstash_config_var.sh
    $ logstash -e $logstash_config

Once we'll see `Logstash startup completed` message we'll know that logstash started observing `log/` directory for
changes in `monitor*.log` files. Then we can run our test application in another terminal and let logstash do its work
in the background. Hopefully we'll get something like:
 
    Logstash startup completed
    {"time":"2015-06-23T14:20:41.505Z","created_class":"io.scalac.amv.testapp.PongActor","created_hash":"177961682"}
    {"time":"2015-06-23T14:20:41.505Z","created_class":"io.scalac.amv.testapp.PingActor","created_hash":"1104535636"}
    {"time":"2015-06-23T14:20:41.513Z","transmission":"8928329738146084964","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"1104535636","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.514Z","transmission":"8928329738146084964","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"177961682","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.518Z","transmission":"-2831032146892188031","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"177961682","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.518Z","transmission":"-2831032146892188031","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"1104535636","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.519Z","transmission":"2706173154284636071","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"1104535636","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.519Z","transmission":"2706173154284636071","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"177961682","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.519Z","transmission":"8891833362865728270","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"177961682","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.520Z","transmission":"8891833362865728270","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"1104535636","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.520Z","transmission":"-4019579096403579839","sender_class":"io.scalac.amv.testapp.PingActor","sender_hash":"1104535636","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.520Z","transmission":"-4019579096403579839","receiver_class":"io.scalac.amv.testapp.PongActor","receiver_hash":"177961682","message_class":"io.scalac.amv.testapp.PingActor$PingMessage","message_hash":"696210608"}
    {"time":"2015-06-23T14:20:41.520Z","transmission":"4677494376210994657","sender_class":"io.scalac.amv.testapp.PongActor","sender_hash":"177961682","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.521Z","transmission":"4677494376210994657","receiver_class":"io.scalac.amv.testapp.PingActor","receiver_hash":"1104535636","message_class":"io.scalac.amv.testapp.PongActor$PongMessage","message_hash":"-595598217"}
    {"time":"2015-06-23T14:20:41.532Z","stopped_class":"io.scalac.amv.testapp.PongActor","stopped_hash":"177961682"}
    {"time":"2015-06-23T14:20:41.535Z","stopped_class":"io.scalac.amv.testapp.PingActor","stopped_hash":"1104535636"}

Result would be JSON objects separated by new lines.

## Visualization

To visualize data in the form of graph open file `visualize/index.html`. Due to some browser's policy concerning
reading files from disc (e.g. Chrome forbid to read `file://` URLs from local websites to improve security) you might
have to run this file through some local server. On Linux easiest approach would be to `cd` into the `visualize/`
directory and run command:

    $ python -m SimpleHTTPServer
    
or

    $ ./run_localhost
    
It will run simple client allowing you to access content of the folder through `localhost:8000`:

    http://localhost:8000/index.html
    
## TL;DR for running example

    # open console #1
    cd akka-message-visualization/
    source ./logstash-conf/set_logstach_config_var.sh
    logstash -e $logstash_config
    # open console #2 without closing console #1
    cd akka-message-visualization/
    sbt testapp/run
    sbt testapp/run
    # Ctrl+C on console #1 to quit logstash
    cd visualize/
    ./run_localhost.sh
    # open http://localhost:8000 in your browser
    
## Design of PoC, limitations and conclusions

To generate visualization of messaging within Akka system we need to know when actors are spawned and stopped, and when
they send and receive messages. Birth and death of actor let us visualize its whole lifecycle, not just the time span
from first transfer of message concerning it to the last one. Visualization of message transfer requires knowledge of
sender, receiver and when sending and receiving happened.
 
Unfortunately currently Akka doesn't allow us to perform non-invasive way of listening of all of those events. While
lifecycle logging option allow us to learn about when actors were created, restarted or stopped it doesn't support
logging messaging out-of-the box. I haven't also found a way to add such listeners globally even using extensions.

Therefore monitoring of leaving and arriving messages is done explicitly using `ActorMonitor` trait, `monitorIncoming`
partial function and `monitorOutgoing` `ActorRef` wrapper. They use `MessagingLogger` extension to supply uniform
logging format for 4 interesting us events (actor creation/stopping, message arrival/departure).

Since at both departure and arrival we have access only to message and current actor to obtain whole transmission we
need to store both events separately and pair them together later on. Simplest solution would be pairing them by message
since it is the only common part in both events. When we create new message each time, message's hash should be enough
to pair both events (assuming that it wasn't overridden from `Object`s default one), and message's type will be useful
additional information. Similarly we can use such hash to distinguish actors. Such simplified use case is currently
implemented in test application.

However, this will produce invalid results in case we either override hashcode or reuse the same message over more than
one recorded transmission. Hash would also change if message came from a remote actor. To work around such issue we
wrapped messages with `MessageWithID` that carries some unique identifier and after message arrival we unwrap it for
a partial functions. `MessagingLogger` ignores wrapper and records message and unique identifier.
   
Those limitations mean that the project which would decide on using visualization would have to introduce a lot of
boilerplate code and additional conventions. Depending on usefulness of the tool we might consider request Akka authors
for API which would allow us to avoid changes all over the project.
