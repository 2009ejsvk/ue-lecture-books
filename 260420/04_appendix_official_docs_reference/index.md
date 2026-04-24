---
title: 260420 04 공식 문서 부록
---

# 260420 04 공식 문서 부록

[이전: 03 ItemBox Drop 효과와 획득 오버랩](../03_intermediate_itembox_drop_effect_and_overlap/) | [260420 허브](../) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)

## 문서 개요

`260420`은 사망 후처리, 물리 전환, 보상 생성, 오버랩 획득이 한 번에 붙는 날이다.
공식 문서 기준으로 다시 읽으면 이 흐름은 `Animation Notify`, `Physics Asset`, `Collision / Trigger` 층으로 정리된다.

## 1. `Animation Notifies`는 사망 후처리의 시간표다

강의의 `AnimNotify_Death()`는 단순 콜백이 아니라, 사망 애니메이션 안에서 후반 처리를 언제 열지 정하는 접점이다.
그래서 아래 문서를 먼저 보면 좋다.

- [Animation Notifies in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine?application_version=5.6)

이 문서를 기준으로 보면 `260420`의 Death 노티파이는 공격 판정 노티파이의 변형이 아니라, 사망 후처리용 시간표라고 이해할 수 있다.

## 2. `Physics Asset`는 랙돌의 전제 조건이다

사망 후 메시를 물리 오브젝트로 넘기려면, 본마다 어떤 물리 바디를 쓸지 미리 준비돼 있어야 한다.
그래서 아래 두 문서가 바로 `260420`와 이어진다.

- [Creating a New Physics Asset in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/creating-a-new-physics-asset-in-unreal-engine)
- [Editing the Physics Asset of a Physics Body in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/editing-the-physics-asset-of-a-physics-body-in-unreal-engine)

이 문서들을 같이 보면 `SetAllBodiesBelowSimulatePhysics`, `WakeAllRigidBodies`, `bBlendPhysics`가 왜 따로 존재하는지 훨씬 또렷해진다.

## 3. `Collision Overview`와 `Trigger Volume`은 ItemBox를 더 단순하게 읽게 해 준다

세 번째 강의의 `ItemOverlap()`도 새로운 발상이 아니라, 이미 익숙한 충돌/트리거 문법의 연장선이다.

- [Collision in Unreal Engine - Overview](https://dev.epicgames.com/documentation/en-us/unreal-engine/collision-in-unreal-engine---overview)
- [Trigger Volume Actors in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/trigger-volume-actors-in-unreal-engine?application_version=5.6)

이 관점으로 보면 `ItemBox`는 특별한 경제 시스템 액터가 아니라, "오버랩 이벤트를 이용하는 보상 액터"라고 훨씬 단순하게 읽힌다.

## 4. 추천 읽기 순서

이번 날짜는 아래 순서로 읽으면 가장 자연스럽다.

1. `Animation Notifies`
2. `Creating a New Physics Asset`
3. `Editing the Physics Asset of a Physics Body`
4. `Collision Overview`
5. `Trigger Volume Actors`

이 순서가 좋은 이유는 먼저 사망 후처리 타이밍을 잡고, 그 다음 죽은 몸을 물리로 넘기는 전제를 보고, 마지막에 보상 오브젝트 획득 규칙으로 내려올 수 있기 때문이다.

## 정리

공식 문서 기준으로 다시 보면 `260420`은 아래 다섯 가지를 배우는 날이다.

1. 사망 후처리는 애니메이션 시간표와 함께 움직여야 한다.
2. 랙돌은 Physics Asset이 있어야 성립한다.
3. 살아 있을 때의 전투 충돌과 죽은 뒤의 물리 충돌은 분리해야 한다.
4. 보상 오브젝트도 결국 오버랩 기반 이벤트 액터다.
5. 그래서 `260420`은 죽는 모션 추가가 아니라, 사망 이후 파이프라인을 완성하는 날이다.

[이전: 03 ItemBox Drop 효과와 획득 오버랩](../03_intermediate_itembox_drop_effect_and_overlap/) | [260420 허브](../) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)
