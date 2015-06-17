package io.scalac.amv.testapp

import akka.actor.ActorSystem
import com.typesafe.config.ConfigFactory

object ApplicationMain extends App {
  val system = ActorSystem("TestActorMonitorSystem", ConfigFactory.load)
  val pingActor = system.actorOf(PingActor.props, "pingActor")
  pingActor ! PingActor.Initialize
  // This example app will ping pong 3 times and thereafter terminate the ActorSystem -
  // see counter logic in PingActor
  system.awaitTermination()
}
