---
title: 260415 05 현재 프로젝트 C++ 부록
---

# 260415 05 현재 프로젝트 C++ 부록

[260415 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)

## 문서 개요

`260415`의 핵심은 "몬스터 하나"보다 `필드 안에서 몬스터가 받는 문맥`이다.
현재 프로젝트 C++ 기준으로 이 흐름은 `MonsterSpawnPoint -> MonsterGAS -> MonsterGASController -> BTTask_PatrolGAS / BTTask_TraceGAS` 순으로 이어진다.

## 1. `AMonsterSpawnPoint`가 스폰 규칙과 순찰 입력을 한 액터에 묶는다

헤더만 봐도 이 클래스가 단순 위치 마커가 아니라는 점이 드러난다.

- `mPatrolPath`: 에디터에서 수정하는 입력용 스플라인
- `mPatrolPoints`: 런타임 순찰 좌표 배열
- `mSpawnClass`: 어떤 몬스터를 만들지
- `mSpawnTime`: 재생성 훅

즉 SpawnPoint는 `스폰 규칙 + 순찰 입력 + 재생성 준비`를 함께 들고 있는 필드용 액터다.

## 2. `OnConstruction()`이 입력 경로를 실행 데이터로 번역한다

이 날짜의 중요한 설계 포인트는 스플라인을 곧바로 AI가 읽지 않는다는 점이다.
`OnConstruction()`이 그 스플라인을 `mPatrolPoints` 배열로 바꿔 놓기 때문에, 런타임의 Patrol 태스크는 단순 좌표 배열만 보면 된다.

즉 사람은 곡선으로 편집하고, AI는 좌표 배열로 실행한다.

## 3. `SpawnMonster()`가 몬스터에게 필드 문맥을 같이 전달한다

현재 branch 기준 `SpawnMonster()`는 아래 일을 한 번에 처리한다.

- `SpawnActor<AMonsterGAS>`로 실제 몬스터 생성
- 캡슐 높이를 읽어 Z 위치 보정
- `SetSpawnPoint(this)`로 소속 SpawnPoint 전달
- `SetPatrolPoints(mPatrolPoints)`로 순찰 데이터 전달

즉 스폰 직후의 몬스터는 그냥 "생성된 액터"가 아니라, 이미 `어느 필드 문맥에서 태어났는지`를 알고 있는 상태다.

## 4. `AMonsterGAS`가 순찰 데이터와 전투 수치를 함께 들고 있는 허브가 된다

현재 프로젝트에선 `AMonsterGAS`가 아래를 함께 소유한다.

- `mSpawnPoint`
- `mPatrolPoints`
- `mPatrolIndex`
- `UAbilitySystemComponent`
- `UMonsterAttributeSet`

즉 이 클래스는 순찰용 상태와 전투용 수치를 함께 들고 있는 공통 허브다.
이 때문에 `BTTask_PatrolGAS`와 `BTTask_TraceGAS`가 같은 본체를 공유하면서도 서로 다른 문맥을 처리할 수 있다.

## 5. `PossessedBy()`와 `SetAITree()`가 스폰된 몬스터를 실제 AI 상태로 올린다

스폰된 몬스터가 실제로 생각하려면 컨트롤러가 붙고 BT가 실행돼야 한다.
현재 branch에선 그 연결을 `AMonsterNormalGAS::PossessedBy()`가 맡고, 실제 로드와 실행은 `AMonsterGASController::SetAITree()`가 맡는다.

즉 `260415`의 BT는 에디터 자산이 아니라, 스폰 직후 런타임 상태를 여는 스위치다.

## 6. `OnTarget()`, `Patrol`, `Trace`가 상태 전환을 완성한다

현재 프로젝트 기준 핵심 전환은 아래처럼 이어진다.

1. `OnTarget()`이 감지 성공 시 `Blackboard.Target`을 채우고 `DetectTarget(true)`를 호출한다.
2. `BTTask_PatrolGAS`는 Target이 없을 때만 `MoveToLocation()`으로 순찰한다.
3. `BTTask_TraceGAS`는 Target이 생기면 `MoveToActor()`로 추적한다.
4. 거리 조건이 `AttackDistance` 이하가 되면 Trace 역할을 닫고 다음 전투 브랜치가 재평가되게 넘긴다.

즉 `260415`는 "순찰 구현"이 아니라, `비전투 문맥 -> 감지 -> 추적 문맥`으로 넘어가는 상태 전환 구조를 만드는 날이다.

## 정리

현재 프로젝트 C++ 기준으로 다시 보면 `260415`의 요점은 아래다.

1. `AMonsterSpawnPoint`가 스폰 규칙과 순찰 입력을 만든다.
2. `OnConstruction()`이 스플라인을 `PatrolPoints`로 바꾼다.
3. `SpawnMonster()`가 몬스터에게 필드 문맥을 넘긴다.
4. `AMonsterNormalGAS::PossessedBy()`가 BT 실행을 시작한다.
5. `AMonsterGASController::OnTarget()`이 감지를 블랙보드와 이동 상태로 번역한다.
6. `BTTask_PatrolGAS`와 `BTTask_TraceGAS`가 `MoveToLocation()`과 `MoveToActor()`를 나눠 맡는다.

[260415 허브](../) | [이전: 04 공식 문서 부록](../04_appendix_official_docs_reference/)
