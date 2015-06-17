name := "akka-message-visualization"

version := Common.version

resolvers in ThisBuild += Resolver.typesafeRepo("releases")

scalacOptions in ThisBuild ++= Seq("-unchecked", "-deprecation", "-feature", "-Xfatal-warnings")

scalaVersion := Common.scalaVersion

ivyScala := ivyScala.value map {
  _.copy(overrideScalaVersion = true)
}

lazy val root = project.in(file("."))
  .aggregate(testapp)

lazy val testapp = project
  .enablePlugins(PlayScala)
  // .dependsOn()
