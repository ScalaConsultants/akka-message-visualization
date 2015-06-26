package io.scalac.amv.randcalc

import akka.actor._
import io.scalac.amv.monitor.ActorMonitor

import scala.util.Random

class Child extends Actor with ActorLogging with ActorMonitor {
  import Child._
  import ActorMonitor._

  implicit val executor = context.system.dispatcher

  var schedule: Cancellable = _

  val seed = random.nextInt

  def receive = monitorIncoming <-- {
    case Parent.Calculate(x) =>
      log.info("In Child - received x to Calculate: {}", x)
      Thread.sleep(1000)
      monitorOutgoing --> sender() ! Calculated(seed, x, seed/x)
  }
}

object Child {
  import scala.language.postfixOps
  import scala.concurrent.duration._

  val random = new Random
  val delay  = 1 seconds
  val props  = Props[Child]
  case class Calculated(seed: Int, x: Int, result: Int)
  case class DelayedResponse(x: Int)
}
