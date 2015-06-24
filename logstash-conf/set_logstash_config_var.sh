#!/bin/bash
read -d '' logstash_config <<- CONFIG
  # Read all .log files with names staring with "monitor"
  input { file { path => "$PWD/logs/monitor*.log" } }

  # Match log output
  filter {
    grok { match => [
      "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Created: %{NOTSPACE:created_class}:%{NUMBER:created_hash}",
      "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Stopped: %{NOTSPACE:stopped_class}:%{NUMBER:stopped_hash}",
      "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Msg %{NUMBER:transmission} Received: %{NOTSPACE:receiver_class}:%{NUMBER:receiver_hash} <- %{NOTSPACE:message_class}:%{NUMBER:message_hash}",
      "message", "\\\[DEBUG\\\] %{TIMESTAMP_ISO8601:time} - Msg %{NUMBER:transmission} Sent: %{NOTSPACE:sender_class}:%{NUMBER:sender_hash} -> %{NOTSPACE:message_class}:%{NUMBER:message_hash}"
    ] }
    mutate { remove_field => ["message","@version","@timestamp","host","path","_grokparsefailure"] }
  }

  # Output results
  output {
    stdout { codec => json_lines }
    file   { codec => json_lines
             path  => "$PWD/visualize/data.txt" }
  }
CONFIG
export logstash_config
echo "Run this script as: source ${0}"
echo 'Then logstash config will be stored within $logstash_config variable'
echo 'Run: logstash -e $logstash_config'
