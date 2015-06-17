package io.scalac.amv.extension

import akka.actor.{ActorSystem, ExtendedActorSystem, ExtensionId, ExtensionIdProvider}

object MessagingLogger extends ExtensionId[MessagingLoggerImpl] with ExtensionIdProvider {
  override def lookup = MessagingLogger

  override def createExtension(system: ExtendedActorSystem) = new MessagingLoggerImpl(system)

  override def get(system: ActorSystem) = super.get(system)
}
