package io.scalac.amv.testapp

import akka.actor.{Actor, ActorLogging, Props}
import io.scalac.amv.monitor.ActorMonitor

class PingActor extends Actor with ActorLogging with ActorMonitor {
  import PingActor._
  import ActorMonitor._
  
  var counter = 0
  val pongActor = context.actorOf(PongActor.props, "pongActor")

  def receive = monitorIncoming <-- {
    case Initialize =>
      log.info("In PingActor - starting ping-pong")
      monitorOutgoing --> pongActor ! PingMessage("ping")
    case PongActor.PongMessage(text) =>
      log.info("In PingActor - received message: {}", text)
      counter += 1
      if (counter == 3) context.system.shutdown()
      else monitorOutgoing --> sender() ! PingMessage("ping")
  }
}

object PingActor {
  val props = Props[PingActor]
  case object Initialize
  case class PingMessage(text: String)
}
