---
title: 260421 부록 - 언리얼 공식 문서 참고 가이드
---

# 부록. 언리얼 공식 문서 참고 가이드

[이전: 부록 07](../07_appendix_cheatsheet/) | [허브](../)

## 이 페이지의 목적

이번 교재는 `D:\UnrealProjects\GASDocumentation` 예제를 중심으로 설명했지만, 개념의 기준점은 결국 Epic 공식 문서에 있다.
이 부록은 “어떤 문서를 어떤 장에서 참고했는지”를 한 번에 보기 위한 페이지다.

## 가장 먼저 볼 공식 문서

- [Understanding the Unreal Engine Gameplay Ability System](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system)
  GAS 전체 구조를 가장 잘 보여 주는 개요 문서다. `ASC`, `Gameplay Ability`, `Attribute Set`, `Gameplay Effect`, `Gameplay Effect Calculations`, `Gameplay Cues`를 한 번에 본다.

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  Ability의 생명주기, `GiveAbility`, `CanActivateAbility`, `TryActivateAbility`, `CommitAbility`, `CancelAbility`, `EndAbility`, Instancing Policy, Replication을 보기 좋다.

- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine?application_version=5.7)
  태그 딕셔너리, 계층형 구조, 컨테이너와 질의, 상태 표현 관점에서 확인하기 좋다.

## 개념 참고용으로 같이 보면 좋은 공식 문서

- [Gameplay Attributes and Gameplay Effects (UE 4.27)](https://dev.epicgames.com/documentation/en-us/unreal-engine/gameplay-attributes-and-gameplay-effects?application_version=4.27)
  버전은 오래됐지만, Attribute와 Effect의 역할을 풀어 설명하는 문서로는 여전히 매우 좋다. 특히 `Attribute Set은 네이티브 코드로 만들고 ASC에 등록한다`, `GameplayEffect는 Attribute를 바꾸는 수단이다`라는 설명이 선명하다.

- [UAbilityTask API Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/API/Plugins/GameplayAbilities/UAbilityTask)
  AbilityTask가 어떤 계층의 도구인지 확인할 때 참고하기 좋다. `FireGun` 같은 비동기 Ability를 읽을 때 유용하다.

## 장별 공식 문서 추천

### 초급 1편과 같이 보기 좋은 문서

- `Understanding the Unreal Engine Gameplay Ability System`
- `Using Gameplay Tags in Unreal Engine`

이 조합은 `GAS가 뭔지`, `Tag가 왜 필요한지`를 먼저 잡기에 좋다.

### 초급 2편과 같이 보기 좋은 문서

- `Using Gameplay Abilities in Unreal Engine`
- `UAbilityTask API Reference`

이 조합은 `CanActivateAbility`, `ActivateAbility`, `CancelAbility`, Instancing Policy를 이해하는 데 좋다.

### 중급 1편과 같이 보기 좋은 문서

- `Understanding the Unreal Engine Gameplay Ability System`
- `Gameplay Attributes and Gameplay Effects (UE 4.27)`

이 조합은 `Attribute`, `AttributeSet`, `Effect`, `Effect Calculation` 관계를 잡기에 좋다.

### 중급 2편과 같이 보기 좋은 문서

- `Using Gameplay Abilities in Unreal Engine`
- `Understanding the Unreal Engine Gameplay Ability System`

이 조합은 `GiveAbility`와 시작 스탯/Effect 초기화를 연결해서 보기 좋다.

### 고급 1편과 같이 보기 좋은 문서

- `Using Gameplay Abilities in Unreal Engine`
- `UAbilityTask API Reference`
- `Understanding the Unreal Engine Gameplay Ability System`

이 조합은 `AbilityTask`, `Effect Calculations`, 비동기 공격 Ability 파이프라인을 읽기에 좋다.

### 고급 2편과 같이 보기 좋은 문서

- `Understanding the Unreal Engine Gameplay Ability System`
- `Using Gameplay Abilities in Unreal Engine`
- `Using Gameplay Tags in Unreal Engine`

이 조합은 ASC의 역할, 복제/예측, 태그 기반 상태 관리를 멀티플레이 구조와 함께 읽기에 좋다.

## 버전 참고

이번 교재는 예제 프로젝트와 현재 공식 문서를 같이 읽는 구조라서, 문서 표현이 조금 다르게 보일 수 있다.
특히 `Gameplay Effects` 쪽은 UE 5.3 이후 `Modular Gameplay Effects` 변화가 있어서, 오래된 자료와 최신 자료의 UI나 용어가 조금 다를 수 있다.

따라서 아래처럼 보면 가장 안전하다.

- 구조 개요와 최신 방향
  `5.7` 공식 문서
- Attribute/Effect 개념 설명
  `4.27` 공식 문서도 함께 참고

## 한 줄 정리

이번 GAS 교재는 예제 코드를 읽기 쉽게 풀어 쓴 문서이고, Epic 공식 문서는 그 개념의 기준점이다.
둘을 같이 보면 “예제는 왜 이렇게 짜여 있지?”가 훨씬 덜 헷갈린다.
