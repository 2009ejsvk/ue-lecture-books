---
title: 260415 04 공식 문서 부록
---

# 260415 04 공식 문서 부록

[260415 허브](../) | [이전: 03 타겟 인식과 Move To](../03_intermediate_target_detection_and_move_to/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)

## 문서 개요

`260415`는 몬스터 하나의 공격 기술보다, `필드에서 태어나고 걷고 감지하면 추적으로 바뀌는 구조`를 다루는 날이다.
이 흐름은 공식 문서 기준으로도 `Spawn`, `Navigation`, `AI Perception`, `Behavior Tree` 네 층으로 깔끔하게 나뉜다.

## 1. 이번 날짜와 직접 연결되는 공식 문서

- [Spawning Actors in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/spawning-actors-in-unreal-engine)
- [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
- [Navigation Components in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-components-in-unreal-engine)
- [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
- [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)

## 2. `Spawn`와 `Navigation` 문서는 `SpawnPoint -> PatrolPoints -> Move To`를 더 선명하게 만든다

강의 1장과 2장의 핵심은 몬스터를 월드에 직접 박아 두는 대신, `SpawnPoint`가 문맥을 만들고 몬스터는 그 문맥을 받아 움직이게 만드는 것이다.
공식 문서의 `Spawning Actors`와 `Basic Navigation`도 같은 흐름을 다른 표현으로 설명한다.

- 스폰 문서: 언제 어디서 어떤 액터를 만들 것인가
- 내비게이션 문서: 만들어진 액터가 어떻게 목적지까지 갈 것인가

즉 `260415`의 중요한 점은 스폰과 이동을 한 함수로 뭉개는 것이 아니라, `입력 문맥`과 `실행 문맥`을 분리한다는 데 있다.

## 3. `AI Perception`과 `Behavior Tree` 문서는 `OnTarget -> Blackboard.Target -> MoveToActor` 전환을 표준 구조로 묶어 준다

강의 3장의 핵심 전환은 아래 순서다.

- `AI Perception`: 타깃을 감지한다
- `Blackboard`: 감지한 타깃을 기억한다
- `Behavior Tree`: 타깃이 있으면 순찰 대신 추적 브랜치를 탄다

즉 `OnTarget()`이 단순 감지 이벤트가 아니라 상태 전환 함수라는 설명은, 공식 문서 기준으로도 아주 자연스럽다.

## 4. 추천 읽기 순서

이번 날짜는 아래 순서로 읽으면 가장 자연스럽다.

1. [Spawning Actors in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/spawning-actors-in-unreal-engine)
2. [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
3. [Navigation Components in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/navigation-components-in-unreal-engine)
4. [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
5. [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)

## 정리

공식 문서 기준으로 다시 보면 `260415`는 아래 다섯 가지를 배우는 날이다.

1. `SpawnPoint`는 단순 위치가 아니라 스폰 문맥이다.
2. `PatrolPath`는 편집용 입력이고 `PatrolPoints`는 런타임 순찰 데이터다.
3. `NavMesh`와 `Move To`는 필드 이동의 전제다.
4. `AI Perception`과 `Behavior Tree`는 감지 후 상태 전환의 표준 구조다.
5. 그래서 `260415`는 몬스터 하나를 만드는 날이 아니라, 필드형 몬스터 시스템을 밑바닥부터 조립하는 날이다.

[260415 허브](../) | [이전: 03 타겟 인식과 Move To](../03_intermediate_target_detection_and_move_to/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)
