package io.scalac.amv.testapp

import akka.actor.{Actor, ActorLogging, Props}
import io.scalac.amv.monitor.ActorMonitor

class PongActor extends Actor with ActorLogging with ActorMonitor {
  import PongActor._
  import ActorMonitor._

  def receive = monitorIncoming <-- {
    case PingActor.PingMessage(text) =>
      log.info("In PongActor - received message: {}", text)
      monitorOutgoing --> sender ! PongMessage("pong")
  }
}

object PongActor {
  val props = Props[PongActor]
  case class PongMessage(text: String)
}
