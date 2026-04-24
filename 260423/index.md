---
title: 260423 UE20252 실전 프로젝트에서 GAS 공격, GameplayCue, MonsterGAS를 연결하는 교재
---

# 260423 UE20252 실전 프로젝트에서 GAS 공격, GameplayCue, MonsterGAS를 연결하는 교재

## 문서 개요

이 문서는 `260423_1_GAS 공격 완성`, `260423_2_GameplayCue 적용`, `260423_3_몬스터 공격 GAS 적용` 세 강의를 기준으로,
`260422`에서 닫아 둔 플레이어 공격 GAS 흐름을 실제 연출과 몬스터 전투까지 확장하는 과정을 다시 정리한 보충 교재다.

`260422`가 `GameplayEffect`와 `SetByCaller`, `DamageSpec`, `ApplyGameplayEffectSpecToTarget`까지를 닫는 날이었다면,
`260423`은 그 파이프라인이 왜 "완성된 공격 시스템"으로 읽혀야 하는지를 보여 주는 날이라고 보면 된다.

이번 날짜의 핵심은 아래 한 줄로 요약할 수 있다.

`DamageSpec 완성 -> GameplayCue로 타격 연출 분리 -> MonsterGAS가 같은 Ability.Attack 파이프라인을 재사용`

코드 이름으로 다시 쓰면 아래 흐름이다.

`GameplayAbility_Attack에서 EffectContext와 DamageSpec 완성 -> GameplayEffect_Damage가 GameplayCue.Battle.Attack 태그를 싣고 적용 -> GameplayCueNotify_StaticBase와 BPGCN_ShareDamage가 연출 실행 -> MonsterGAS / MonsterGASController / BTTask_AttackGAS / MonsterNormalGAS_Warrior가 같은 Ability.Attack 이벤트를 몬스터 공격에도 연결`

즉 `260423`은 "플레이어 전용 GAS 예제"를 넘어서, 같은 공격 규칙과 태그 체계를 플레이어와 몬스터가 함께 쓰기 시작하는 전환점이다.

## 이 교재를 만드는 데 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260423_1_GAS 공격 완성.mp4`
- `D:\UE_Academy_Stduy_compressed\260423_2_GameplayCue 적용.mp4`
- `D:\UE_Academy_Stduy_compressed\260423_3_몬스터 공격 GAS 적용.mp4`
- `D:\UE_Academy_Stduy_compressed\260423_1_GAS 공격 완성.srt`
- `D:\UE_Academy_Stduy_compressed\260423_2_GameplayCue 적용.srt`
- `D:\UE_Academy_Stduy_compressed\260423_3_몬스터 공격 GAS 적용.srt`
- `D:\UE_Academy_Stduy_compressed\260423_1_GAS 공격 완성_frames_scene_medium_srt`
- `D:\UE_Academy_Stduy_compressed\260423_2_GameplayCue 적용_frames_scene_medium_srt`
- `D:\UE_Academy_Stduy_compressed\260423_3_몬스터 공격 GAS 적용_frames_scene_medium_srt`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Attack.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_Damage.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Cue\Static\GameplayCueNotify_StaticBase.h`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Cue\Static\GameplayCueNotify_StaticBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterGASController.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterNormalGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterNormalGAS_Warrior.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\MonsterNormalGAS_Gunner.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\BTTask_TraceGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Monster\GAS\BTTask_AttackGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGame.ini`
- `D:\UnrealProjects\UE_Academy_Stduy\Content\GAS\Cue\BPGCN_ShareDamage.uasset`

## 추천 읽기 순서

1. 중급 1편: `260422`에서 만든 공격 파이프라인이 어디서 진짜 완성되는지 확인
2. 중급 2편: 수치 시스템과 연출 시스템을 `GameplayCue`로 분리하는 이유 확인
3. 고급 1편: 같은 공격 Ability가 몬스터 AI 루프에도 어떻게 재사용되는지 확인

## 중급

- [01. GAS 공격 파이프라인 완성](./01_intermediate_gas_attack_completion/)
  `EffectContext`, `AddHitResult`, `DamageSpec`, `ApplyGameplayEffectSpecToTarget`, `PostGameplayEffectExecute`를 한 흐름으로 다시 묶는다.

- [02. GameplayCue 적용과 타격 연출 분리](./02_intermediate_gameplaycue_application/)
  `GameplayCue.Battle.Attack`, `GameplayCueNotify_StaticBase`, `BPGCN_ShareDamage`, `GameplayCueNotifyPaths`가 어떻게 연결되는지 정리한다.

## 고급

- [03. MonsterGAS에 공격 파이프라인 적용](./03_advanced_monster_attack_gas_application/)
  `MonsterGAS`, `MonsterGASController`, `BTTask_TraceGAS`, `BTTask_AttackGAS`, `MonsterNormalGAS_Warrior`를 기준으로, 플레이어 공격 GAS가 몬스터 AI 전투 루프에 어떻게 이식되는지 설명한다.

## 빠른 선택 가이드

- `260422`는 읽었는데, 그 다음 실제 공격이 어디서 완성되는지 한 번에 보고 싶다
  `01`
- 숫자 감소와 타격 이펙트를 왜 같은 함수에 섞지 않는지 감이 안 온다
  `02`
- 몬스터도 같은 `Ability.Attack` 태그를 쓸 수 있는지 보고 싶다
  `03`
- 현재 branch에서 플레이어와 몬스터가 같은 GAS 파이프라인을 얼마나 공유하는지 알고 싶다
  `01 -> 02 -> 03`

## 이 날짜의 핵심 목표

이번 날짜의 목표는 아래 세 문장을 체감하는 데 있다.

- `Damage는 GameplayEffect가 맡고, 타격 반응은 GameplayCue가 맡는다.`
- `Ability.Attack은 플레이어 입력용 태그일 뿐 아니라, 몬스터 공격 이벤트에도 재사용 가능한 공용 태그다.`
- `MonsterGAS는 기존 몬스터 AI 뼈대를 유지한 채, ASC와 AttributeSet을 얹어 GAS 전투 루프를 받아들인다.`

즉 `260423`은 `260422`의 후속편이면서, 이후 `MonsterGAS` 문서를 읽을 때 기준이 되는 다리 역할을 한다.
