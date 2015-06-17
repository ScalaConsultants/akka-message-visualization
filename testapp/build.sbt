name := "testapp"

version := Common.version

scalaVersion := Common.scalaVersion

ivyScala := ivyScala.value map {
  _.copy(overrideScalaVersion = true)
}

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % Common.akkaVersion,
  "com.typesafe.akka" %% "akka-slf4j" % Common.akkaVersion
)
