package io.scalac.amv.monitor

import akka.actor._
import io.scalac.amv.extension.{MessagingLoggerImpl, MessagingLogger}

import scala.language.implicitConversions

trait ActorMonitor extends Actor { this: Actor =>
  private val monitorExtension = context.system.extension(MessagingLogger)
  private val thisClassName    = this.getClass.getName
  private val thisClassHash    = this.hashCode

  protected lazy val monitorIncoming = MonitorReceived(thisClassName, thisClassHash, monitorExtension)

  protected lazy val monitorOutgoing = MonitoringActorRef(thisClassName, thisClassHash, monitorExtension)

  override def preStart() = {
    super.preStart()
    monitorExtension.registerCreation(thisClassName, thisClassHash)
  }

  override def postStop() = {
    super.postStop()
    monitorExtension.registerStopping(thisClassName, thisClassHash)
  }
}

object ActorMonitor {
  implicit def monitorReceivedAsReceive(monitor: MonitorReceived[Any, Unit]) = new MonitorReceivedFunction(monitor)
}
