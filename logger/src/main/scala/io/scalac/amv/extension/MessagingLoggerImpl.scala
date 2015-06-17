package io.scalac.amv.extension

import akka.actor.Extension

class MessagingLoggerImpl extends Extension {
  def registerIncomingMessage(receiverClass: String, receiverHash: Int, messageClass: String, messageHash: Int) = {

  }

  def registerOutgoingMessage(senderClass: String, senderHash: Int, messageClass: String, messageHash: Int) = {

  }
}
