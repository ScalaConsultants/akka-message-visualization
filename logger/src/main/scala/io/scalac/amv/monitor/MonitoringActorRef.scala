package io.scalac.amv.monitor

import akka.actor.{ActorContext, Actor, ActorRef}
import io.scalac.amv.extension.MessagingLoggerImpl

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

class MonitoringActorRef(redirectedRef: ActorRef,
                        senderClassName: String,
                        senderClassHash: Int,
                        messagingLogger: MessagingLoggerImpl)
  extends ActorRefWrapper(redirectedRef) {

  override def !(message: Any)(implicit sender: ActorRef = Actor.noSender) = {
    val messageWithID = MessageWithID(message)
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash, messageWithID.transmissionID)
    super.!(messageWithID)(sender)
  }

  override def tell(message: Any, sender: ActorRef) = {
    val messageWithID = MessageWithID(message)
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash, messageWithID.transmissionID)
    super.tell(messageWithID, sender)
  }

  override def forward(message: Any)(implicit context: ActorContext) = {
    val messageWithID = MessageWithID(message)
    val messageClass = message.getClass.getName
    val messageHash  = message.hashCode
    messagingLogger.registerOutgoingMessage(senderClassName, senderClassHash, messageClass, messageHash, messageWithID.transmissionID)
    super.forward(messageWithID, context)
  }
}

class MonitoringActorRefBuilder(senderClassName: String, senderClassHash: Int, messagingLogger: MessagingLoggerImpl) {
  def -->(actor: ActorRef) = new MonitoringActorRef(actor, senderClassName, senderClassHash, messagingLogger)
}

object MonitoringActorRef {
  def apply(senderClassName: String, senderClassHash: Int, messagingLogger: MessagingLoggerImpl) =
    new MonitoringActorRefBuilder(senderClassName, senderClassHash, messagingLogger)
}
