---
title: 260408 04 공식 문서로 다시 읽는 공격 몽타주와 노티파이 구조
---

# 260408 04 공식 문서로 다시 읽는 공격 몽타주와 노티파이 구조

[이전: 03 콤보와 템플릿](../03_intermediate_combo_sections_and_animation_template/) | [260408 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)

## 왜 공식 문서를 같이 보는가

`260408`은 기능을 하나 추가하는 날이 아니라, 전투 애니메이션 구조를 엔진 표준 용어로 정리하는 날이다.
그래서 이 날짜부터는 공식 문서를 같이 보면 개념이 훨씬 덜 헷갈린다.

## 이번 날짜와 직접 맞닿는 공식 문서

1. [Animation Montage in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-montage-in-unreal-engine?application_version=5.6)
2. [Using Layered Animations in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-layered-animations-in-unreal-engine)
3. [Animation Notifies in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-notifies-in-unreal-engine?application_version=5.6)
4. [Transition Rules in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/transition-rules-in-unreal-engine?application_version=5.6)
5. [Animation Blueprint Linking in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-blueprint-linking-in-unreal-engine?application_version=5.6)

## 어떻게 연결해서 읽으면 좋은가

### 1. `Animation Montage`

공격을 상태 머신 내부에 직접 넣지 않고 별도 시간축으로 분리하는 이유를 가장 먼저 잡아 준다.
이번 날짜의 `AnimMontage + Slot` 구조를 이해하는 출발점이다.

### 2. `Using Layered Animations`

이동과 공격이 어떻게 공존하는지, 그리고 슬롯이나 레이어드 블렌딩이 왜 필요한지 감각을 잡아 준다.
`TemplateFullBody` 슬롯 규약을 이해할 때도 도움이 된다.

### 3. `Animation Notifies`

`ComboStart`, `ComboEnd`, `PlayerAttack`, `SkillCasting` 같은 이벤트를 "애니메이션 안의 시간표"로 읽게 만들어 준다.

### 4. `Transition Rules`

점프나 전투 전환처럼 상태가 바뀌는 기준을 정리할 때 좋다.
`260408` 후반 템플릿 그래프와 다음 날짜 전투 확장 파트를 읽기 쉬워진다.

### 5. `Animation Blueprint Linking`

공용 그래프와 캐릭터별 자산 차이를 나누는 템플릿 사고방식을 보강해 준다.
`ABPPlayerTemplate` 같은 부모 구조를 왜 만드는지 이해할 때 특히 좋다.

## 추천 읽기 순서

1. `Animation Montage`
2. `Using Layered Animations`
3. `Animation Notifies`
4. `Transition Rules`
5. `Animation Blueprint Linking`

이 순서대로 보면 `공격 재생 경로 -> 프레임 이벤트 -> 전이 규칙 -> 공용 템플릿 구조`가 자연스럽게 이어진다.

## 한 줄 정리

공식 문서 기준으로 다시 보면 `260408`은 `Montage + Slot + Notify + Template` 조합으로 전투 애니메이션 구조를 만드는 날이다.

[이전: 03 콤보와 템플릿](../03_intermediate_combo_sections_and_animation_template/) | [260408 허브](../) | [다음: 05 현재 프로젝트 C++](../05_appendix_current_project_cpp_reference/)
