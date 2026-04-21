---
title: 260421 초급 1편 - GAS란 무엇인가
---

# 초급 1편. GAS란 무엇인가

[교재 허브로 돌아가기](../)

## 이 편의 목표

이 편에서는 GAS의 세부 함수보다, `왜 GAS를 쓰는지`와 `핵심 구성요소 다섯 개`를 먼저 잡는다.
처음에는 이 다섯 이름만 정확히 구분해도 충분하다.

## GAS는 무엇을 해결하려고 하나

게임 전투 시스템을 직접 만들면 보통 아래 같은 코드가 여러 군데 흩어진다.

- 공격 입력은 Character가 처리
- 체력은 PlayerState나 Character가 저장
- 데미지는 `TakeDamage()`에서 직접 계산
- 버프와 디버프는 나중에 별도 로직 추가
- 쿨다운과 마나 소모도 각 스킬 클래스마다 따로 처리

처음에는 간단하지만, 스킬 수가 늘어나고 상태이상이 많아질수록 구조가 빠르게 복잡해진다.

GAS는 이걸 역할별로 분리해 준다.

- 스킬 실행
- 버프/디버프
- 코스트와 쿨다운
- HP/MP 같은 Attribute
- 상태 태그
- 멀티플레이 동기화

즉 GAS는 `전투 시스템용 프레임워크`라고 보면 된다.

## 가장 먼저 외울 다섯 이름

### 1. `ASC`

`AbilitySystemComponent`다.
전투 시스템 관리자라고 생각하면 된다.

이 컴포넌트가 담당하는 것은 아래와 같다.

- Ability 실행
- GameplayEffect 적용
- GameplayTag 관리
- 코스트와 쿨다운 처리
- Attribute 변경 감시

### 2. `AttributeSet`

숫자 저장소다.
`Health`, `Mana`, `Armor`, `MoveSpeed` 같은 값이 여기에 들어간다.

이 예제에서는 `UGDAttributeSetBase`가 그 역할을 한다.

### 3. `GameplayAbility`

행동 자체다.
점프, 평타, 화염구, 대시, 힐 같은 “무엇을 한다”가 여기에 들어간다.

이 예제에서는 아래 파일들이 대표 예시다.

- `UGDGA_CharacterJump`
- `UGDGA_FireGun`

### 4. `GameplayEffect`

결과다.
데미지, 회복, 버프, 디버프, 쿨다운, 초기 스탯 적용 같은 “무슨 변화가 생기나”가 여기에 들어간다.

즉 Ability와 Effect는 역할이 다르다.

- Ability
  행동 절차
- Effect
  결과 반영

### 5. `GameplayTag`

상태 이름표다.
문자열처럼 보이지만, 상태를 공통 규칙으로 관리하는 데 쓰인다.

예를 들면 아래 같은 태그가 있다.

- `Ability.Jump`
- `Ability.Skill.Ability1`
- `State.Dead`
- `State.AimDownSights`
- `Event.Montage.SpawnProjectile`

## 예제 프로젝트 기준 대응표

- `UGDAbilitySystemComponent`
  ASC
- `UGDAttributeSetBase`
  AttributeSet
- `UGDGA_CharacterJump`, `UGDGA_FireGun`
  GameplayAbility
- `DefaultAttributes`, `StartupEffects`, `DamageGameplayEffect`
  GameplayEffect
- `Ability.Jump`, `State.Dead`
  GameplayTag

## 기존 방식과 GAS 방식 비교

기존 방식은 보통 이렇게 흘러간다.

`입력 -> Character 함수 호출 -> 트레이스/판정 -> TakeDamage() -> HP 감소`

GAS 방식은 이렇게 분리된다.

`입력 -> Ability 실행 -> Effect 적용 -> AttributeSet 반영 -> 후처리`

즉 기존 방식은 한 클래스가 여러 책임을 같이 들고 있고, GAS는 책임을 잘게 나눠서 맡긴다.

## 왜 GAS가 커질수록 유리한가

다음 같은 게임일수록 GAS 장점이 커진다.

- 스킬 수가 많다
- 버프/디버프가 많다
- 상태이상이 많다
- 종족/직업/장비/패시브 조합이 많다
- 멀티플레이를 고려한다

반대로 아주 작은 싱글플레이 프로토타입은 오히려 직접 구현이 더 빠를 수도 있다.

즉 GAS는 “항상 더 좋다”보다, “전투 시스템이 커질수록 더 유리하다”에 가깝다.

## 이 편에서 기억할 한 줄

`Ability는 행동, Effect는 결과, AttributeSet은 숫자 저장소, ASC는 전투 관리자, Tag는 상태 이름표`

## 공식 문서 연결

- [Understanding the Unreal Engine Gameplay Ability System](https://dev.epicgames.com/documentation/en-us/unreal-engine/understanding-the-unreal-engine-gameplay-ability-system)
  Epic은 GAS를 `Actor가 소유하고 발동하는 능력과 상호작용을 위한 프레임워크`로 설명하고, 핵심 구성요소를 `ASC`, `Gameplay Ability`, `Attribute Set`, `Gameplay Effect`, `Gameplay Cue`로 나눈다.

- [Using Gameplay Abilities in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-abilities-in-unreal-engine)
  Ability는 비용, 조건, 입력, 애니메이션, 비동기 실행, 네트워크 복제를 다룰 수 있는 객체라는 점을 강조한다.

- [Using Gameplay Tags in Unreal Engine](https://dev.epicgames.com/documentation/en-us/unreal-engine/using-gameplay-tags-in-unreal-engine?application_version=5.7)
  Gameplay Tag는 계층형 이름표 시스템이고, 상태와 조건을 공통 규칙으로 연결하는 데 쓰인다는 점을 확인할 수 있다.

## 다음 편

[초급 2편. Jump Ability로 보는 GAS 생명주기](../02_beginner_jump_ability/)
