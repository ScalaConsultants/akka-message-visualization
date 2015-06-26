name := "randcalc"

version := Common.version

scalaVersion := Common.scalaVersion

ivyScala := ivyScala.value map {
  _.copy(overrideScalaVersion = true)
}

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor"     % Common.akkaVersion,
  "com.typesafe.akka" %% "akka-slf4j"     % Common.akkaVersion,
  "org.slf4j"         %  "slf4j-api"      % "1.7.6",
  "ch.qos.logback"    % "logback-classic" % "1.1.2"
)
