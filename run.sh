#! /bin/bash

trap '[ "$pid1" ] && kill "$pid1"; [ "$pid2" ] && kill "$pid2"; [ "$pid3" ] && kill "$pid3";' EXIT

mkdir -p ./logs

echo $(date -u) Starting docker stack | tee logs/timeline.log
docker stack deploy --compose-file docker-compose.yml grpctest

#echo $(date -u) Wait 2 seconds... | tee -a timeline.log
#sleep 2s

docker service logs grpctest_pingserver --timestamps -f &> logs/pingserver.log &
pid1=$!

docker service logs grpctest_pingclient --timestamps -f &> logs/pingclient.log &
pid2=$!

docker service logs grpctest_nonserver --timestamps -f &> logs/nonserver.log &
pid3=$!

#sleep 5s

echo $(date -u) Scale servers to 2 | tee -a logs/timeline.log
docker service update grpctest_pingserver --replicas 2 --detach=false --quiet

#echo $(date -u) Wait 5 seconds... | tee -a logs/timeline.log
#sleep 5s

echo $(date -u) Scale clients to 1 | tee -a logs/timeline.log
docker service update grpctest_pingclient --replicas 1 --detach=false --quiet

#echo $(date -u) Wait 15 seconds... | tee -a logs/timeline.log
sleep 15s

echo $(date -u) Scale servers to 0 and non-servers to 2 | tee -a logs/timeline.log
docker service update grpctest_pingserver --replicas 0 --detach=false --quiet
docker service update grpctest_nonserver --replicas 2 --detach=false --quiet

#echo $(date -u) Wait 5 seconds... | tee -a logs/timeline.log
sleep 5s

echo $(date -u) Scale servers back to 2 | tee -a logs/timeline.log
docker service update grpctest_pingserver --replicas 2 --detach=false --quiet

#echo $(date -u) Wait 10 seconds... | tee -a logs/timeline.log
sleep 10s

echo $(date -u) Scale non-servers to 0 | tee -a logs/timeline.log
docker service update grpctest_nonserver --replicas 0 --detach=false --quiet

#echo $(date -u) Wait 30 seconds... | tee -a logs/timeline.log
sleep 30s

echo $(date -u) Scale all services to 0 | tee -a logs/timeline.log
docker service update grpctest_pingserver --replicas 0 --detach=false --quiet
docker service update grpctest_pingclient --replicas 0 --detach=false --quiet

echo $(date -u) Shutdown docker stack | tee -a logs/timeline.log
docker stack rm grpctest

