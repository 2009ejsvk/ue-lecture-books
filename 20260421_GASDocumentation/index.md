---
title: 20260421 GASDocumentation으로 배우는 GAS 분권형 교재
---

# 20260421 GASDocumentation으로 배우는 GAS 분권형 교재

## 문서 개요

이 문서는 `D:\UnrealProjects\GASDocumentation` 예제 프로젝트를 기준으로, 언리얼 `Gameplay Ability System`을 난이도별로 나눠 배우기 위한 분권형 교재다.
기존 한 페이지 문서를 그대로 읽으면 흐름은 이어지지만, 초보자 입장에서는 한 번에 너무 많은 개념이 들어와서 부담이 커질 수 있다.
그래서 이번에는 `초급 -> 중급 -> 고급 -> 부록` 구조로 나누고, 각 편이 한 가지 주제를 분명하게 설명하도록 재구성했다.

이번 교재는 다음 자료를 바탕으로 작성했다.

- `D:\UnrealProjects\GASDocumentation` 실제 예제 코드
- 로컬 엔진의 `GameplayAbilities` 관련 헤더와 구현
- 기존 `UE20252` 프로젝트와 비교하며 정리한 학습 메모

핵심 편에는 실제 C++ 코드 발췌와 함께, 초심자가 따라 읽기 쉽도록 설명용 주석을 다시 달아 두었다.

## 이 교재를 읽는 가장 좋은 순서

처음 GAS를 배울 때는 멀티플레이 구조보다 `Ability 한 개가 어떻게 실행되는지`를 먼저 잡는 편이 훨씬 쉽다.
그래서 추천 순서는 아래와 같다.

1. 초급 1편: GAS란 무엇인가
2. 초급 2편: Jump Ability로 보는 생명주기
3. 중급 1편: AttributeSet과 GameplayEffect
4. 중급 2편: 초기화와 Ability 지급
5. 부록: 함수 치트시트와 추천 파일 순서
6. 고급 1편: FireGun과 데미지 파이프라인
7. 고급 2편: PlayerState와 멀티플레이 구조

## 초급

- [01. GAS란 무엇인가](./01_beginner_gas_overview/)
  GAS의 목적과 다섯 핵심 이름 `ASC`, `AttributeSet`, `GameplayAbility`, `GameplayEffect`, `GameplayTag`를 처음부터 정리한다.

- [02. Jump Ability로 보는 GAS 생명주기](./02_beginner_jump_ability/)
  `UGDGA_CharacterJump` 하나를 기준으로 `CanActivateAbility`, `ActivateAbility`, `CommitAbility`, `CancelAbility`가 각각 무엇인지 아주 쉽게 풀어 본다.

## 중급

- [03. AttributeSet과 GameplayEffect 후처리](./03_intermediate_attributes_and_effects/)
  `UGDAttributeSetBase`를 기준으로 `FGameplayAttributeData`, `ATTRIBUTE_ACCESSORS`, `Damage` 메타 Attribute, `PreAttributeChange`, `PostGameplayEffectExecute`를 정리한다.

- [04. 초기화와 Ability 지급](./04_intermediate_initialization_and_granting/)
  `GDCharacterBase.cpp`를 기준으로 `InitializeAttributes`, `AddStartupEffects`, `AddCharacterAbilities`, 그리고 특수 상황에서만 직접 `SetHealth`를 쓰는 이유를 설명한다.

## 고급

- [05. FireGun과 데미지 파이프라인](./05_advanced_firegun_and_damage_pipeline/)
  `UGDGA_FireGun`과 `UGDDamageExecCalculation`을 기준으로, 공격 Ability가 어떻게 `SetByCaller -> ExecutionCalculation -> Damage 메타 Attribute -> Health 감소`로 이어지는지 설명한다.

- [06. PlayerState, Owner/Avatar, 멀티플레이 구조](./06_advanced_playerstate_and_multiplayer/)
  왜 이 예제가 `PlayerState`에 ASC를 두는지, `PossessedBy`, `OnRep_PlayerState`, `InitAbilityActorInfo(PS, this)`가 어떤 의미인지 정리한다.

## 부록

- [07. GAS 함수 치트시트와 추천 파일 순서](./07_appendix_cheatsheet/)
  처음에 외우면 좋은 GAS 함수들과, 예제 프로젝트를 어떤 순서로 읽으면 덜 어렵게 느껴지는지 한 장에 정리했다.

- [08. 언리얼 공식 문서 참고 가이드](./08_appendix_official_docs_reference/)
  이번 교재에서 연결한 Epic 공식 문서를 주제별로 다시 모아 두고, 어떤 페이지를 어떤 목적에 참고하면 좋은지 정리했다.

## 빠른 선택 가이드

- GAS를 정말 처음 본다
  `01 -> 02 -> 03`
- Attribute와 Effect가 헷갈린다
  `03`
- 시작 스탯과 Ability 지급 위치가 궁금하다
  `04`
- 공격 스킬이 어떻게 분리되는지 보고 싶다
  `05`
- 왜 PlayerState에 ASC를 두는지 궁금하다
  `06`
- 함수 이름만 빠르게 훑고 싶다
  `07`
- 공식 문서 원문까지 같이 보고 싶다
  `08`

## 이 날짜의 핵심 목표

이번 날짜의 목적은 GAS를 “처음부터 전부” 이해하는 것이 아니라, 아래 흐름을 몸에 익히는 데 있다.

`Ability 발동 -> Effect 적용 -> Attribute 반영 -> 후처리 -> 나중에 멀티플레이 구조로 확장`

즉 처음에는 구조보다 체감을 먼저 잡고, 나중에 정석 배치를 따라가는 식으로 읽는 것이 가장 덜 힘들다.
