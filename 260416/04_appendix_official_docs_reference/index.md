---
title: 260416 04 공식 문서 부록
---

# 260416 04 공식 문서 부록

[260416 허브](../) | [이전: 03 MonsterAttack Task와 Notify 루프](../03_intermediate_monster_attack_task_and_notify_loop/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)

## 문서 개요

`260416`은 몬스터가 실제 전투 루프를 도는 날이다.
입문자 입장에선 `Trace`, `Attack`, `AnimNotify`, `NormalAttack()`이 따로 노는 기능처럼 보일 수 있지만, 공식 문서 기준으로 보면 `Behavior Tree`, `Navigation`, `Animation Blueprint`, `Animation Notifies` 층으로 깔끔하게 정리된다.

## 1. 이번 날짜와 직접 연결되는 공식 문서

- [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
- [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
- [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
- [Animation Blueprint Editor in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-editor-in-unreal-engine?application_version=5.6)
- [Animation Notifies in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine?application_version=5.6)

## 2. `Behavior Tree`와 `Navigation` 문서는 `Trace -> Attack` 전이를 더 선명하게 만든다

강의 2장과 3장의 핵심은 몬스터가 언제까지 추적하고 언제부터 공격 문맥으로 넘어갈지를 정하는 것이다.
공식 문서 기준으로 보면 이 과정은 아래처럼 읽힌다.

- `Navigation`: 타깃에게 실제로 이동할 수 있는가
- `Behavior Tree`: 이동 브랜치를 계속 탈지, 다음 행동 브랜치로 넘어갈지 결정하는가

즉 `Trace` 태스크가 공격 거리 진입 시 `Failed`를 반환하는 구조도, 오류가 아니라 `다음 브랜치를 열기 위한 규칙`으로 이해할 수 있다.

## 3. `Animation Blueprint`와 `Animation Notifies` 문서는 `AttackTarget / AttackEnd` 설계를 시간축으로 정리해 준다

이번 날짜의 중요한 포인트는 입력 대신 `애니메이션 시간축`이 전투 타이밍을 여는 쪽에 있다는 점이다.

- AI 태스크가 공격 문맥을 세팅한다
- 애니메이션이 재생되다 정확한 프레임에 `AnimNotify_Attack()`가 올라온다
- 종료 프레임에 `AnimNotify_AttackEnd()`가 올라온다

즉 `260416`은 기능 추가보다 `전투 타이밍을 시스템끼리 어떻게 연결하는가`를 배우는 날이다.

## 4. 추천 읽기 순서

이번 날짜는 아래 순서로 읽으면 가장 자연스럽다.

1. [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
2. [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
3. [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
4. [Animation Blueprint Editor in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-editor-in-unreal-engine?application_version=5.6)
5. [Animation Notifies in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine?application_version=5.6)

## 정리

공식 문서 기준으로 다시 보면 `260416`은 아래 다섯 가지를 배우는 날이다.

1. 추적과 공격은 같은 AI 트리 안에서 전이되는 행동 브랜치다.
2. `MoveToActor()`는 내비게이션 문맥 위에서만 의미가 있다.
3. 몬스터 애니메이션은 상태 기반으로 유지하는 편이 단순하고 안정적이다.
4. 실제 타격 시점은 `Notify`가 알려 준다.
5. 그래서 `260416`은 공격 기능 추가보다 `전투 타이밍 연결`을 배우는 날이다.

[260416 허브](../) | [이전: 03 MonsterAttack Task와 Notify 루프](../03_intermediate_monster_attack_task_and_notify_loop/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)
