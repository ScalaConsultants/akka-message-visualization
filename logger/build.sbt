name := "logger"

version := Common.version

scalaVersion := Common.scalaVersion

ivyScala := ivyScala.value map {
  _.copy(overrideScalaVersion = true)
}

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor"                    % Common.akkaVersion,
  "com.typesafe.akka" %% "akka-slf4j"                    % Common.akkaVersion,
  "com.typesafe.akka" %% "akka-testkit"                  % Common.akkaVersion % "test",
  "org.scalatest"     %% "scalatest"                     % "2.2.1" % "test",
  "org.scalamock"     %% "scalamock-scalatest-support"   % "3.2" % "test",
  "org.mockito"       % "mockito-core"                   % "1.10.8" % "test",
  "org.slf4j"         %  "slf4j-api"                     % "1.7.6",
  "org.slf4j"         %  "slf4j-simple"                  % "1.7.6",
  "org.apache.logging.log4j" % "log4j-to-slf4j"          % "2.1",
  "ch.qos.logback" % "logback-classic" % "1.0.13"        % "runtime"
)
