---
title: 260424 UE20252 실전 프로젝트에서 MonsterGAS 사망 처리, 커스텀 ASC 설계, AbilityTask 전환을 다루는 교재
---

# 260424 UE20252 실전 프로젝트에서 MonsterGAS 사망 처리, 커스텀 ASC 설계, AbilityTask 전환을 다루는 교재

## 문서 개요

이 문서는 `260424_1_몬스터 죽음 GAS 적용`, `260424_2_사용자 정의 AbilitySystemComponent와 소모 마나 지정`, `260424_3_AbilityTask와 애니메이션 몽타주 Ability 재생` 세 강의를 기준으로,
`260421 ~ 260423`에서 만들었던 GAS 플레이어/몬스터 전투 흐름을 한 단계 더 구조화하는 과정을 다시 정리한 보충 교재다.

`260423`이 `Damage GameplayEffect`, `GameplayCue`, `MonsterGAS 공격 연결`까지 닫아 두는 날이었다면,
`260424`는 그 다음 단계로 아래 세 질문을 한 번에 다루는 날이라고 보면 된다.

- HP가 0이 되었을 때, 사망 처리의 진입점은 `TakeDamage()`가 아니라 어디에 두어야 하는가
- Ability를 누가 가지고 있고 언제 지급하는지, 왜 `ASC` 설계가 중요해지는가
- 지금 `AnimInstance`가 들고 있는 몽타주 재생 책임을 왜 나중에는 `AbilityTask`로 옮기려 하는가

이번 날짜의 핵심은 아래 한 줄로 요약할 수 있다.

`AttributeSet 후처리로 사망을 감지 -> Actor별 죽음 처리 경로를 분기 -> Ability 공통 베이스와 ASC 구조를 정리 -> 몽타주 재생 책임을 AbilityTask 쪽으로 옮길 준비`

코드 이름으로 다시 쓰면 아래 흐름이다.

`BaseAttributeSet::PostGameplayEffectExecute()에서 HP 변화를 받음 -> MonsterGAS::Death() / EndPlay() 같은 후반 처리와 연결할 구조를 고민 -> GameplayAbility_Base가 ManaCost, CoolDown, 공통 활성화 규칙을 품음 -> 이후 AbilityTask_PlayMontageAndWait로 재생/완료/취소를 Ability 안에서 닫는 방향을 설계`

즉 `260424`는 "지금 당장 완성된 기능을 쓰는 날"이면서 동시에, `현재 branch를 다음 단계로 어떻게 옮길 것인가`를 보여 주는 전환점이다.

## 이 교재를 만드는 데 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260424_1_몬스터 죽음 GAS 적용.mp4`
- `D:\UE_Academy_Stduy_compressed\260424_2_사용자 정의 AbilitySystemComponent와 소모 마나 지정.mp4`
- `D:\UE_Academy_Stduy_compressed\260424_3_AbilityTask와 애니메이션 몽타주 Ability 재생.mp4`
- `D:\UE_Academy_Stduy_compressed\260424_1_몬스터 죽음 GAS 적용.srt`
- `D:\UE_Academy_Stduy_compressed\260424_2_사용자 정의 AbilitySystemComponent와 소모 마나 지정.srt`
- `D:\UE_Academy_Stduy_compressed\260424_3_AbilityTask와 애니메이션 몽타주 Ability 재생.srt`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_ManaCost.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_CoolDown.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_CoolDown.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGASAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterAttributeSet.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\PlayerCharacterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\PlayerTemplateAnimInstance.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`

## 추천 읽기 순서

1. 중급 1편: `HP 감소 -> 사망 처리`를 GAS 기준으로 어디에 걸어야 하는지 확인
2. 중급 2편: `ManaCost`, `CoolDown`, `공용 Ability`, `ASC 설계`가 왜 한 묶음으로 설명되는지 확인
3. 고급 1편: 지금 `AnimInstance`가 하는 몽타주 재생을 왜 `AbilityTask`로 옮기려 하는지 확인
4. 부록: 실제 문서 보강이나 역추적이 필요할 때 `AcademyUtility` 덤프 워크플로를 참고

## 중급

- [01. MonsterGAS 죽음 처리와 AttributeSet 콜백 설계](./01_intermediate_monster_death_gas_application/)
  `PostGameplayEffectExecute`, `MonsterAttributeSet`, `MonsterGAS::Death()`, `EndPlay()`를 연결해 "사망의 진입점"을 다시 정리한다.

- [02. 커스텀 AbilitySystemComponent와 ManaCost 구조 정리](./02_intermediate_custom_abilitysystemcomponent_and_mana_cost/)
  `GameplayAbility_Base`, `GameplayEffect_ManaCost`, `mMana`, `mCoolDown`, `GiveAbility`, `InputID` 문맥을 한 번에 묶는다.

## 고급

- [03. AbilityTask와 몽타주 재생 책임 옮기기](./03_advanced_abilitytask_and_montage_ability_playback/)
  `PlayerAnimInstance`, `PlayerTemplateAnimInstance`, `ShinbiGAS`, `GameplayEffect_CoolDown`을 기준으로, 현재 몽타주 재생 구조를 AbilityTask 쪽으로 넘길 이유를 설명한다.

## 부록

- [04. AcademyUtility 덤프 워크플로 부록](./04_appendix_academyutility_dump_workflow/)
  `Dump.Path`, `Dump.GameplayTags`, `Dump.Level`, `Generate.*`와 `Saved/AcademyUtility` 읽는 순서를 정리한다.

## 빠른 선택 가이드

- `MonsterGAS`도 HP가 0이 되면 언제 `Death()`로 들어가야 하는지 알고 싶다
  `01`
- 지금처럼 `PlayerCharacterGAS`와 `MonsterGAS`가 각자 `UAbilitySystemComponent`를 들고 있을 때, 왜 커스텀 ASC 이야기가 나오는지 알고 싶다
  `02`
- 현재 `PlayAttack()`, `PlaySkill1()`를 나중에 `AbilityTask_PlayMontageAndWait`로 바꾸는 이유가 궁금하다
  `03`
- 교재를 더 보강하려고 코드/블루프린트/태그/레벨 정보를 다시 덤프해야 한다
  `04`
- 현재 branch에서 `이미 구현된 것`과 `강의에서 다음 단계로 설계한 것`을 함께 읽고 싶다
  `01 -> 02 -> 03`

## 이 날짜의 핵심 목표

이번 날짜의 목표는 아래 세 문장을 체감하는 데 있다.

- `죽음 감지는 AttributeSet 후처리에서 받되, 실제 사망 연출과 정리 작업은 Actor별로 분기해야 한다.`
- `Ability를 누가 보유하고 언제 지급하는지는 입력 바인딩 문제가 아니라 ASC 구조 문제다.`
- `현재 branch는 아직 AnimInstance 중심 몽타주 구조지만, 다음 단계는 AbilityTask가 재생/완료/취소를 가져가는 구조다.`

즉 `260424`는 `260423`의 후속편이면서, 이후 `Skill2`, `CoolDown`, `Custom ASC`, `AbilityTask` 확장을 읽기 위한 설계 기준점을 마련하는 날짜다.
