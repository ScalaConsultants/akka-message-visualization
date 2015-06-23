package io.scalac.amv.monitor

import akka.actor.Actor
import io.scalac.amv.extension.MessagingLoggerImpl

class MonitorReceived[-A, +B](
    wrappedFunction: PartialFunction[A, B],
    receiverName: String,
    receiverHash: Int,
    extension: MessagingLoggerImpl) {

  def orElse[A1 <: A, B1 >: B](that: PartialFunction[A1, B1]) =
    wrap(wrappedFunction orElse that)

  def andThen[C](k: B => C) = wrap(wrappedFunction andThen k)

  // Unwrapped messages

  def isDefinedAt(x: A) = wrappedFunction isDefinedAt x

  def applyOrElse[A1 <: A, B1 >: B](x: A1, default: A1 => B1): B1 = wrappedFunction applyOrElse(x, default)

  def runWith[U](action: B => U): A => Boolean = wrappedFunction runWith action

  def apply(v1: A): B = wrappedFunction apply v1

  // MessageWithID

  def isDefinedAt[A1 <: A](x: MessageWithID[A1]) = wrappedFunction isDefinedAt x.message

  def applyOrElse[A1 <: A, B1 >: B](x: MessageWithID[A1], default: A1 => B1): B1 =
    wrappedFunction applyOrElse(messageReceived(x), default)

  def apply[A1 <: A](v1: MessageWithID[A1]): B =
    wrappedFunction apply messageReceived(v1)

  // Inner

  private def messageReceived[A1 <: A](messageWithID: MessageWithID[A1]) = messageWithID match {
    case MessageWithID(msg, tid) =>
      extension.registerIncomingMessage(receiverName, receiverHash, msg.getClass.getName, msg.hashCode, tid)
      msg
  }

  private def wrap[C, D](fun: PartialFunction[C, D]) =
    new MonitorReceived[C, D](fun, receiverName, receiverHash, extension)
}

class MonitorReceivedFunction(monitor: MonitorReceived[Any, Unit]) extends Actor.Receive {

  override def isDefinedAt(x: Any): Boolean = x match {
    case mid @ MessageWithID(msg, tid) => monitor isDefinedAt mid
    case _ => monitor isDefinedAt x
  }

  override def applyOrElse[A1 <: Any, B1 >: Unit](x: A1, default: A1 => B1): B1 = x match {
    case mid @ MessageWithID(msg, tid) =>
      if (monitor isDefinedAt mid) monitor apply mid
      else default(msg.asInstanceOf[A1])
    case _ => monitor applyOrElse(x, default)
  }

  override def apply(x: Any): Unit = x match {
    case mid @ MessageWithID(msg, tid) => monitor apply mid
    case _ => monitor apply x
  }

  override def runWith[U](action: Unit => U): Any => Boolean = monitor runWith action
}

class MonitorReceivedBuilder(
    receiverName: String,
    receiverHash: Int,
    extension: MessagingLoggerImpl) {
  def <--(wrapped: PartialFunction[Any, Unit]) =
    new MonitorReceived[Any, Unit](wrapped, receiverName, receiverHash, extension)
}

object MonitorReceived {
  def apply(receiverName: String, receiverHash: Int, extension: MessagingLoggerImpl) =
    new MonitorReceivedBuilder(receiverName, receiverHash, extension)
}
