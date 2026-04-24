---
title: 260417 05 현재 프로젝트 C++ 부록
---

# 260417 05 현재 프로젝트 C++ 부록

[260417 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)

## 문서 개요

`260417`을 현재 프로젝트 C++ 기준으로 다시 읽으면, 이 날짜의 핵심은 "가만히 있는 AI"를 만드는 데 있지 않고 `대기 조건`, `순찰 조건`, `종료 조건`, `다음 인덱스 준비`를 분리해서 비전투 루프를 안전하게 반복시키는 데 있다.

## 1. 큰 흐름은 `SpawnPoint -> Wait -> Patrol -> Repeat`다

현재 구현의 큰 흐름은 아래처럼 이어진다.

1. `MonsterSpawnPoint`가 스플라인을 `mPatrolPoints` 배열로 바꾼다
2. `SpawnMonster()`가 스폰된 몬스터에게 `SetSpawnPoint(this)`, `SetPatrolPoints(mPatrolPoints)`를 넘긴다
3. `UBTTask_MonsterWait`가 `Target`이 없는 동안 `WaitTime`만큼 대기한다
4. 대기가 끝나면 `UBTTask_Patrol`이 열린다
5. `UBTTask_Patrol`이 현재 인덱스 점으로 이동하고, 끝나면 `NextPatrol()`로 다음 점을 준비한다
6. 도중에 `Target`이 생기면 두 태스크 모두 전투 브랜치에 자리를 비켜 준다

즉 `260417`은 비전투 리듬을 반복 가능한 루프로 만드는 날이다.

## 2. `UBTTask_MonsterWait`는 대기 상태를 태스크 메모리에 저장한다

현재 `MonsterWait`의 핵심은 전역 bool이 아니라 `NodeMemory`에 `FWaitTimer`를 올려 둔다는 점이다.
그래서 각 몬스터가 자기 대기 상태를 따로 가진다.

또 `ExecuteTask()`, `TickTask()`, `WaitFinish()`, `OnTaskFinished()`가 각각 역할을 나눠 가진다.

- 시작: `WaitTime`만큼 타이머를 건다
- 갱신: `Target`과 완료 플래그를 계속 본다
- 종료: 타이머를 정리한다

즉 이 태스크는 "대기 시간 재기"보다 `대기 상태 수명주기 관리`에 더 가깝다.

## 3. 순찰 입력 데이터는 스폰 시점에 이미 주입된다

현재 `MonsterSpawnPoint`는 `OnConstruction()`에서 스플라인을 배열로 바꾸고, `SpawnMonster()`에서 그 배열을 몬스터에게 넘긴다.
따라서 Patrol 태스크는 런타임에 복잡한 경로 계산을 다시 하지 않고, 현재 인덱스의 점만 읽으면 된다.

이 구조 덕분에 비전투 루프가 더 단순해진다.

## 4. `UBTTask_Patrol`은 조건이 맞을 때만 현재 점으로 걷게 만든다

현재 `Patrol` 태스크는 아래 전제 위에서만 동작한다.

- `Target`이 없어야 한다
- `GetPatrolEnable()`이 참이어야 한다
- `MoveToLocation(GetPatrolPoint())`가 정상 시작돼야 한다

그리고 `TickTask()`는 아래 종료 조건을 함께 본다.

- 도중에 `Target`이 생겼는가
- `GetMoveStatus()`가 `Idle`로 떨어졌는가
- 거리 `<= 5.f`가 되었는가

즉 Patrol 버그를 볼 때는 이동 함수보다 `왜 지금 이 태스크가 끝나도 된다고 판정되었는가`를 봐야 한다.

## 5. 현재 branch 비교: Patrol 개념은 GAS 쪽에도 그대로 이어진다

현재 저장소에는 `UBTTask_PatrolGAS`가 따로 존재하고, 구조는 거의 같다.
즉 순찰 설명의 원형은 legacy `UBTTask_Patrol`이 가장 선명하지만, 개념 자체는 지금도 그대로 살아 있다.

반면 `Wait` 쪽은 코드 검색 기준 별도 `WaitGAS` 태스크가 보이지 않으므로, 이 날짜의 대기 설명은 여전히 legacy `UBTTask_MonsterWait`를 기준으로 읽는 편이 가장 정확하다.

## 6. 디버깅은 `Blackboard -> 종료 이유 -> Patrol 배열` 순이 가장 빠르다

현재 프로젝트 기준으로 `260417` 비전투 루프를 디버깅할 때는 아래 순서가 가장 효율적이다.

1. `Blackboard.Target`이 비어 있는지 본다
2. `Blackboard.WaitTime`이 너무 작지 않은지 본다
3. `MonsterWait`가 `Succeeded`로 끝났는지, `Failed`로 끝났는지 본다
4. `GetPatrolEnable()`이 참인지 확인한다
5. `GetMoveStatus()`와 거리 `<= 5.f` 조건을 본다
6. `mPatrolIndex`와 `mPatrolPoints`가 실제로 어떤 값을 받았는지 본다

즉 비전투 루프 버그는 보통 `태스크 한 줄`보다 `문맥 조합`에서 풀린다.

## 정리

현재 프로젝트 C++ 기준으로 다시 보면 `260417`의 비전투 루프는 아래 한 문장으로 요약할 수 있다.

`SpawnPoint가 Patrol 배열을 넘긴다 -> MonsterWait가 반응 가능한 대기를 만든다 -> MonsterPatrol이 현재 인덱스 점으로 걷는다 -> OnTaskFinished가 다음 인덱스를 준비한다 -> 언제든 Target이 생기면 전투 브랜치로 빠져나간다`

[260417 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)
