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
      schedule = context.system.scheduler.scheduleOnce(delay)(monitorOutgoing --> self ! DelayedResponse(x))

    case DelayedResponse(x) =>
      val result = if (x == 0) 0 else seed/x
      log.info("In Child - calculation complete, responding")
      monitorOutgoing --> context.parent ! Calculated(seed, x, result)
  }

  override def postStop() = {
    super.postStop()
    if (schedule != null)
      schedule.cancel
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
