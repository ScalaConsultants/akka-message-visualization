package io.scalac.amv.extension

import java.util.Date
import java.text.SimpleDateFormat

import akka.actor.{ExtendedActorSystem, Extension}
import org.slf4j.LoggerFactory

import MessagingLoggerImpl._

class MessagingLoggerImpl(system: ExtendedActorSystem) extends Extension {
  private val logger = LoggerFactory.getLogger(MessagingLogger.getClass)

  private def log(logMessage: String) =
    logger debug s"${dateIso8601Pattern format now} - $logMessage"

  private def now = new Date

  def registerCreation(createdClass: String, createdHash: Int) =
    log(s"Created: $createdClass:$createdHash")

  def registerStopping(stoppedClass: String, stoppedHash: Int) =
    log(s"Stopped: $stoppedClass:$stoppedHash")

  def registerIncomingMessage(receiverClass: String, receiverHash: Int, messageClass: String, messageHash: Int, transmissionID: Long) =
    log(s"Msg $transmissionID Received: $receiverClass:$receiverHash <- $messageClass:$messageHash")

  def registerOutgoingMessage(senderClass: String, senderHash: Int, messageClass: String, messageHash: Int, transmissionID: Long) =
    log(s"Msg $transmissionID Sent: $senderClass:$senderHash -> $messageClass:$messageHash")
}

object MessagingLoggerImpl {
  val dateIso8601Pattern = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
}
