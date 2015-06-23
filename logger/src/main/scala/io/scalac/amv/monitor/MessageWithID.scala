package io.scalac.amv.monitor

import scala.util.Random

case class MessageWithID[A](message: A, transmissionID: Long)

object MessageWithID {
  private val random = new Random

  def apply[A](msg: A) = new MessageWithID(msg, random.nextLong)
}
