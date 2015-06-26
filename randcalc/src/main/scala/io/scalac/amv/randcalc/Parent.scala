package io.scalac.amv.randcalc

import akka.actor.{Cancellable, Actor, ActorLogging, Props}
import io.scalac.amv.monitor.ActorMonitor

import scala.util.Random

class Parent extends Actor with ActorLogging with ActorMonitor {
  import Parent._
  import ActorMonitor._

  implicit val executor = context.system.dispatcher

  var schedule: Cancellable = _

  var counter   = 0
  val random    = new Random

  def receive = monitorIncoming <-- {
    case Initialize =>
      log.info("In Parent - starting calculating")
      for (i <- 0 to childrenNr) context.actorOf(Child.props, "child" + i)
      schedule = context.system.scheduler.schedule(delay, interval)(monitorOutgoing --> self ! AskChildren)

    case AskChildren =>
      log.info("In Parent - asking children for calculations")
      counter += 1
      if (counter == rounds) context.system.shutdown()
      else context.children.foreach(monitorOutgoing --> _ ! Calculate(random.nextInt(maxX+1)))

    case Child.Calculated(seed, x, result) =>
      log.info("In Parent - received calculated: {}/{}={}", seed, x, result)
  }

  override def postStop() = {
    super.postStop()
    if (schedule != null)
      schedule.cancel
  }
}

object Parent {
  import scala.language.postfixOps
  import scala.concurrent.duration._

  val childrenNr = 3
  val delay      = 0 seconds
  val interval   = 1 seconds
  val maxX       = 15
  val rounds     = 10
  val props      = Props[Parent]

  case object Initialize
  case object AskChildren
  case class Calculate(x: Int)
}
