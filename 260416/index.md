---
title: 260416 추적에서 공격으로 넘어가고 노티파이 시점에 타격하는 몬스터 전투 AI 루프
---

# 260416 추적에서 공격으로 넘어가고 노티파이 시점에 타격하는 몬스터 전투 AI 루프

[← 260415](../260415/) | [루트 허브](../index.md) | [260417 →](../260417/)

## 문서 개요

`260416`의 핵심은 몬스터가 실제로 공격하게 만드는 것보다, `추적 -> 공격 -> 노티파이 -> 데미지`를 시간축에 맞춰 하나의 루프로 닫는 데 있다.

이번 날짜의 전체 흐름은 아래 한 줄로 요약할 수 있다.

`EMonsterNormalAnim -> Trace Task -> Attack Task -> AnimNotify -> Damage / Death`

현재 branch 기준으로는 같은 구조가 아래처럼 이어진다.

`MonsterGASAnimInstance -> BTTask_TraceGAS / BTTask_AttackGAS -> AnimNotify -> Ability.Attack / GameplayEffect_Damage`

## 학습 순서

1. [01 MonsterAnimInstance와 상태 번역](./01_intermediate_monster_animinstance_and_state_translation/)
2. [02 MonsterTrace Task와 전이 규칙](./02_intermediate_monster_trace_task_and_transition_logic/)
3. [03 MonsterAttack Task와 Notify 루프](./03_intermediate_monster_attack_task_and_notify_loop/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `AnimInstance`, `Trace`, `Attack`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 10장을 각 편의 설명 흐름에 맞게 재배치했다.
- 강의 캡처에서 `전투 런타임`, `AttackDistance 데이터`, `공격용 블랙보드 키` 컷 3장을 새로 추가했다.
- 현재 branch 기준으로 `MonsterGASAnimInstance`, `BTTask_TraceGAS`, `BTTask_AttackGAS`, `MonsterNormalGAS_Warrior`, `GameplayAbility_Attack` 연결을 함께 보강했다.

## 현재 branch 추적 메모

강의 원형의 전투 루프는 `MonsterAnimInstance -> BTTask_MonsterTrace -> BTTask_MonsterAttack -> MonsterNormal::NormalAttack()` 쪽이었지만, 현재 저장소에는 이 구조가 GAS 라인으로 거의 그대로 이식돼 있다.

- 애니메이션 계약: `UMonsterGASAnimInstance`
- 추적/공격 태스크: `UBTTask_TraceGAS`, `UBTTask_AttackGAS`
- 워리어 공격 본체: `AMonsterNormalGAS_Warrior`
- 데미지 계산/적용: `UGameplayAbility_Attack`, `UGameplayEffect_Damage`

차이는 루프의 모양보다 `실제 데미지를 누가 계산하느냐`에 있다.
legacy는 `TakeDamage()` 직통이고, 현재 워리어는 `Ability / Effect / Cue` 계층으로 넘어갔다.

## 핵심 문장

`260416`의 본질은 공격 기능 하나를 추가하는 데 있지 않고, `전투 타이밍을 AI 태스크와 애니메이션 프레임에 맞춰 연결하는 데` 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260416_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260417](../260417/)부터는 지금 만든 전투 루프가 더 확장되면서, 이후 플레이어/GAS 축과 비교해서 읽을 수 있는 재료가 한층 많아진다.

[← 260415](../260415/) | [루트 허브](../index.md) | [260417 →](../260417/)
