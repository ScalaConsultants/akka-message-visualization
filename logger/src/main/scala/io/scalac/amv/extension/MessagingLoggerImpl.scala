package io.scalac.amv.extension

import akka.actor.{ExtendedActorSystem, Extension}
import akka.event.Logging
import org.slf4j.LoggerFactory

class MessagingLoggerImpl(system: ExtendedActorSystem) extends Extension {
  private val logger = LoggerFactory.getLogger(MessagingLogger.getClass)

  private def log(logMessage: String) = logger.debug(logMessage)

  def registerCreation(createdClass: String, createdHash: Int) =
    log(s"Created: $createdClass:$createdHash")

  def registerStopping(stoppedClass: String, stoppedHash: Int) =
    log(s"Stopped: $stoppedClass:$stoppedHash")

  def registerIncomingMessage(receiverClass: String, receiverHash: Int, messageClass: String, messageHash: Int) =
    log(s"Msg Received: $receiverClass:$receiverHash <- $messageClass:$messageHash")

  def registerOutgoingMessage(senderClass: String, senderHash: Int, messageClass: String, messageHash: Int) =
    log(s"Msg Sent: $senderClass:$senderHash -> $messageClass:$messageHash")
}
