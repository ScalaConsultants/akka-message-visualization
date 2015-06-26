package io.scalac.amv.randcalc

import akka.actor.ActorSystem
import com.typesafe.config.ConfigFactory

object ApplicationMain extends App {
  val system = ActorSystem("TestActorMonitorSystem", ConfigFactory.load)
  val parent = system.actorOf(Parent.props, "Parent")
  parent ! Parent.Initialize
  system.awaitTermination()
}
