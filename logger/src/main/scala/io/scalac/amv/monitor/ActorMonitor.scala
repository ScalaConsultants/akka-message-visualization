package io.scalac.amv.monitor

import akka.actor._
import io.scalac.amv.extension.{MessagingLoggerImpl, MessagingLogger}

trait ActorMonitor { this: Actor =>
  val monitorExtension = context.system.extension(MessagingLogger)
  val thisClassName    = this.getClass.getName
  val thisClassHash    = this.hashCode

  def monitorIncoming: Receive = new Receive {
    def isDefinedAt(message: Any) = {
      val messageClass = message.getClass.getName
      val messageHash  = message.hashCode
      monitorExtension.registerIncomingMessage(thisClassName, thisClassHash, messageClass, messageHash)
      false
    }

    def apply(x: Any) =
      throw new UnsupportedOperationException("`monitorIncoming` should only be used to register incoming message")
  }

  def monitorOutgoing = new WrapperBuilder(thisClassName, thisClassHash, monitorExtension)
}

class ActorRefWrapper(redirectedRef: ActorRef) {
  def !(message: Any)(implicit sender: ActorRef = Actor.noSender) = redirectedRef.!(message)(sender)

  def path = redirectedRef.path

  def compareTo(other: ActorRef) = redirectedRef compareTo other

  def tell(msg: Any, sender: ActorRef) = redirectedRef tell(msg, sender)

  def forward(message: Any)(implicit context: ActorContext) = redirectedRef.forward(message)(context)

  override def hashCode = redirectedRef hashCode()

  override def equals(that: Any) = redirectedRef equals that

  override def toString = redirectedRef toString()
}

class MonitoringActorRefWrapper(
    redirectedRef: ActorRef,
    senderClassName: String,
    senderClassHash: Int,
    messagingLogger: MessagingLoggerImpl)
  extends ActorRefWrapper(redirectedRef) {

  override def tell(message: Any, sender: ActorRef) = {
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash)
    super.tell(message, sender)
  }

  override def forward(message: Any)(implicit context: ActorContext) = {
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash)
    super.forward(message, context)
  }
}

class WrapperBuilder(senderClassName: String, senderClassHash: Int, messagingLogger: MessagingLoggerImpl) {
  def when(actor: ActorRef) = new MonitoringActorRefWrapper(actor, senderClassName, senderClassHash, messagingLogger)
}
