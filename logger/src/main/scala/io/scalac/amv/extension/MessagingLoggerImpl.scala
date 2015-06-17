package io.scalac.amv.extension

import akka.actor.{ExtendedActorSystem, Extension}
import akka.event.Logging

class MessagingLoggerImpl(system: ExtendedActorSystem) extends Extension {
  val logger = Logging.getLogger(system, MessagingLogger)

  private def log(logMessage: String) = logger.info(logMessage)

  def registerIncomingMessage(receiverClass: String, receiverHash: Int, messageClass: String, messageHash: Int) =
    log(s"Msg Received: $receiverClass:$receiverHash <- $messageClass:$messageHash")

  def registerOutgoingMessage(senderClass: String, senderHash: Int, messageClass: String, messageHash: Int) =
    log(s"Msg Sent: $senderClass:$senderHash -> $messageClass:$messageHash")
}
