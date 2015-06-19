package io.scalac.amv.monitor

import akka.actor._
import io.scalac.amv.extension.{MessagingLoggerImpl, MessagingLogger}

trait ActorMonitor extends Actor { this: Actor =>
  private val monitorExtension = context.system.extension(MessagingLogger)
  private val thisClassName    = this.getClass.getName
  private val thisClassHash    = this.hashCode

  protected lazy val monitorIncoming: Receive = new Receive {
    def isDefinedAt(message: Any) = {
      val messageClass = message.getClass.getName
      val messageHash  = message.hashCode
      monitorExtension.registerIncomingMessage(thisClassName, thisClassHash, messageClass, messageHash)
      false
    }

    def apply(x: Any) =
      throw new UnsupportedOperationException("`monitorIncoming` should only be used to register incoming message")
  }

  protected lazy val monitorOutgoing = new WrapperBuilder(thisClassName, thisClassHash, monitorExtension)

  override def preStart() = {
    super.preStart()
    monitorExtension.registerCreation(thisClassName, thisClassHash)
  }

  override def postStop() = {
    super.postStop()
    monitorExtension.registerStopping(thisClassName, thisClassHash)
  }
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

  override def !(message: Any)(implicit sender: ActorRef = Actor.noSender) = {
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash)
    super.!(message)(sender)
  }

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
  def on(actor: ActorRef) = new MonitoringActorRefWrapper(actor, senderClassName, senderClassHash, messagingLogger)

  def ->(actor: ActorRef) = on(actor)
}
