---
title: 260417 04 공식 문서 부록
---

# 260417 04 공식 문서 부록

[260417 허브](../) | [이전: 03 비전투 루프 디버깅](../03_intermediate_noncombat_loop_debugging/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)

## 문서 개요

`260417`은 새 기능을 많이 추가하는 날이라기보다, 이미 만들어 둔 비전투 루프를 안정적으로 돌게 만드는 날이다.
그래서 오히려 `Behavior Tree`, `Navigation`, `AI Perception`, `Visual Logger` 문서와 함께 볼 때 더 잘 읽힌다.

## 1. 이번 날짜와 직접 연결되는 공식 문서

- [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
- [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
- [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
- [Visual Logger in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/visual-logger-in-unreal-engine)

## 2. `Behavior Tree`와 `Navigation` 문서는 `Wait -> Patrol` 루프를 더 명확하게 만든다

이번 날짜의 핵심은 몬스터가 아무것도 안 하는 것처럼 보여도, 실제로는 `대기 -> 순찰 -> 다시 대기`를 반복하는 비전투 브랜치 안에 있다는 점이다.

- `Behavior Tree`: 지금 어떤 비전투 브랜치를 타고 있는가
- `Navigation`: 현재 순찰점까지 실제로 이동 가능한가

즉 `Wait`와 `Patrol`은 보조 기능이 아니라, 전투가 없을 때 AI가 시간을 보내는 기본 행동 트리다.

## 3. `AI Perception`과 `Visual Logger`는 디버깅 순서를 더 실전적으로 정리해 준다

비전투 루프는 보통 한 줄 버그보다 `Target`, `WaitTime`, `PathStatus`, `PatrolIndex`가 서로 엇갈리며 깨지는 경우가 많다.
그래서 공식 문서의 관점도 유용하다.

- `AI Perception`: 감지 정보가 실제로 들어오는가
- `Visual Logger`: 어떤 상태와 이벤트가 언제 기록되는가

즉 `260417`의 핵심은 기술 이름보다 `Blackboard -> 태스크 종료 이유 -> 이동 상태 -> 배열 데이터` 순으로 좁혀 가는 디버깅 습관을 만드는 데 있다.

## 4. 추천 읽기 순서

이번 날짜는 아래 순서로 읽으면 가장 자연스럽다.

1. [Behavior Tree in Unreal Engine - User Guide](https://dev.epicgames.com/documentation/en-us/unreal-engine/behavior-tree-in-unreal-engine---user-guide?application_version=5.6)
2. [Basic Navigation in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/basic-navigation-in-unreal-engine)
3. [AI Perception in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine)
4. [Visual Logger in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/visual-logger-in-unreal-engine)

## 정리

공식 문서 기준으로 다시 보면 `260417`은 아래 다섯 가지를 배우는 날이다.

1. 비전투 루프도 Behavior Tree 안의 정식 행동 브랜치다.
2. `Wait`는 완전 정지가 아니라 반응 가능한 대기여야 한다.
3. `Patrol`은 내비게이션과 종료 조건이 함께 맞아야 안정적으로 돈다.
4. Perception과 Blackboard 값은 디버깅의 첫 출발점이다.
5. 그래서 `260417`은 순찰 기능 추가보다 `AI를 필드에 안전하게 놓는 법`을 배우는 날이다.

[260417 허브](../) | [이전: 03 비전투 루프 디버깅](../03_intermediate_noncombat_loop_debugging/) | [다음: 05 현재 프로젝트 C++ 부록](../05_appendix_current_project_cpp_reference/)
