# Akka Message Visualization

Proof of concept of messaging within Akka visualization.

Currently it's a simple extension to Akka, producing logs which in turn would be used to extract some useful data with
logstash.

For quick example read TL;DR section.

## TL;DR for running example visualization

    # open console #1
    cd akka-message-visualization/
    source ./logstash-conf/set_logstach_config_var.sh
    touch ./logs/monitor.log
    logstash -e $logstash_config
    # open console #2 without closing console #1
    cd akka-message-visualization/
    sbt testapp/run   # for testapp visualization
    sbt randcalc/run  # for randcalc visualization
    # Ctrl+C on console #1 to quit logstash and force it to flush data to data.txt
    cd visualize/
    ./run_localhost.sh
    # open http://localhost:8000 in your browser
    
or if you're lazy:

    cd akka-message-visualization/
    cp example/testapp.txt  visualize/data.txt  # for already processed testapp log
    cp example/randcalc.txt visualize/data.txt  # for already processed randcalc log
    cd visualize/
    ./run_localhost.sh

## Running example project

Simply call:

    $ sbt testapp/run

It is a ping-pong application where `PingActor` and `PongActor` exchange messages. After 3rd `PongMessage` system stops.

Another example is:

    $ sbt randcalc/run
   
There `Parent` queries its 4 children every 1 second, and they respond to it with 1 second delay.

## Requirements and configuration of any project

We need to configure project to make use of our small library. Enable extension in `application.conf`:

    akka {
      extensions = ["io.scalac.amv.extension.MessagingLogger"]
    }

and make sure that logging format in `logback.xml` follow the defined pattern:

    <configuration>
      ...
      <appender name="SomeName" class=...>
        <encoder>
          <pattern>[%-5level] %msg%n</pattern>
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
 * and via environment variables either,
 * observed files matched with wildcard (`logs/monitor*.log`) has to already exists when we start application.
 
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
    
## How to read visualization

Visualization consists of two parts: interactive graph representing messaging within system over the time and timeline
showing actors' lifespans and message transfer in time. Views can be switched using draggable button panel.
 

Graph can be navigated in time using *Play next event* and *Undo last event* buttons. Last played event will be
highlighted on raw JSON log on the right. Meaning of each animation:

 * appearance of named node represents an actor's creation, similarly its disappearance mean that actor was stopped,
 * appearance of red directed edge represent the event of a message's departure, once it reaches addressee arrow will
   turn green and disappear in the next frame,
 * appearance of *unknown receiver* node with red arrow indicates that message was sent but none of currently known
   nodes ever reported that it arrived - it can happen when:
    
    * after message departure system was stopped,
    * addressee was stopped before receiving the message - if actor was restarted and message reached it, then this node
      will disappear once it reach the new addressee,
    * receiver wasn't correctly configured,

 * appearance of *unknown sender* node indicates that message was sent by node that isn't on a list of known alive
   nodes - this can happen when:
   
    * sender was stopped before message arrived,
    * sender wasn't correctly configured,
    
 * short appearance of *stopped [actor]* node indicates that message was sent from actor that died some time before. 

Events occurring in the same millisecond will be displayed on the following order:
 
 * created actors,
 * sent messages,
 * received messages,
 * stopped actors
 
to ensure that graph can be correctly displayed. Occasionally it can make graph more difficult to read and one have to
be aware of that limitation.

Timeline simply shows duration of either an actor's life or a message's transfer duration. Usually it is very short for
messages and much longer for actors. However, if beginning of an interval starts at timeline's beginning (earliest
event) or timeline's end (latest event) it means that complete knowledge wasn't available within logs:

 * actors with lifespan span starting in the beginning were either created as first actors within the system or were
   assumed to live at the beginning of the recorded time frame. Similarly actors which intervals reach the end either
     were stopped at the system shutdown or were alive at the end of recorded time frame,
 * messages' transfers with unknown sending events are assumed to be sent before recording started and are displayed as
   starting at the beginning of timeline. Similarly messages without receiving event are assumed to be still transferred
   at the end of timeline.
   
Assuming that all actors are correctly configured *unknown receiver* and *unknown sender* nodes together with enormously
long message transfers can be used to locate when some actors crashed and had to be stopped or restarted.
    
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

## Possible improvements

Timeline graph could not only show messaging time but also responding - by logging both start of message request and
the end of it, it would be possible to see directly which responses failed and where they took too long. Graph animation
could show parent-child relationship between nodes as well as reason for an actor's death: Poison Pill, crash, shutdown.
Whole representation could also be modified to not only replay already finished recording but also respond to log's data
incoming online. Graph visualization could also offer different strategies with handling corner cases: e.g. not
displaying messages from not observed nodes instead of showing *unknown senders*. Such strategies could be set up basing
on packages and types.

Developed by [Scalac](https://scalac.io/?utm_source=scalac_github&utm_campaign=scalac1&utm_medium=web)
