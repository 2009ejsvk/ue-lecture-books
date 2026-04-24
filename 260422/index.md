---
title: 260422 UE20252 실전 프로젝트로 이어지는 GameplayEffect 적용 교재
---

# 260422 UE20252 실전 프로젝트로 이어지는 GameplayEffect 적용 교재

## 문서 개요

이 문서는 `260422_1_GameplayEffect 적용` 강의를 기준으로, `260421`에서 개념으로 배운 GAS를 실제 `UE20252` 프로젝트 코드에 붙이는 과정을 다시 정리한 보충 교재다.
`260421`이 `GASDocumentation` 예제와 공식 용어에 익숙해지는 날이었다면, `260422`는 그 개념이 우리 프로젝트 안에서 어떤 파일과 함수로 내려앉는지 체감하는 날이라고 보면 된다.

이번 강의의 핵심은 아래 한 줄로 요약할 수 있다.

`공격 입력 -> 공격 이벤트 전달 -> Ability 시작 -> 내 MP 차감 -> 맞은 대상 HP 감소 -> GameplayCue로 타격 반응`

코드 이름으로 다시 쓰면 아래 흐름이다.

`GameplayEvent로 공격 Ability 발동 -> Source ASC/AttributeSet 확보 -> ManaCost GameplayEffect 생성 -> SetByCaller로 소모량 주입 -> ApplyGameplayEffectSpecToSelf -> TargetData 해석 -> Damage GameplayEffect 생성 -> ApplyGameplayEffectSpecToTarget -> PostGameplayEffectExecute와 GameplayCue로 마무리`

즉 이번 날짜는 “GameplayEffect가 무엇인가”를 다시 설명하는 날이 아니라, `GameplayEffect를 우리 코드에 실제로 어떻게 꽂는가`를 다루는 실전편이다.

## 이 교재를 만드는 데 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260422_1_GameplayEffect 적용.mp4`
- `D:\UE_Academy_Stduy_compressed\260422_1_GameplayEffect 적용.srt`
- `D:\_ai_subtitles\260422_1_GameplayEffect 적용\captures`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\Player\GAS\ShinbiGAS.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Attack.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\GameplayAbility_Base.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_ManaCost.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Effect\GameplayEffect_Damage.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\Cue\Static\GameplayCueNotify_StaticBase.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252\GAS\BaseAttributeSet.cpp`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGameplayTags.ini`
- `D:\UnrealProjects\UE_Academy_Stduy\Config\DefaultGame.ini`

## 추천 읽기 순서

1. 초급 1편: 이벤트 공격이 Ability로 들어오는 전체 흐름
2. 중급 1편: ManaCost GameplayEffect와 `SetByCaller`
3. 중급 2편: Spec 적용과 `PostGameplayEffectExecute`
4. 고급 1편: `TargetData`, `TargetASC`, 다음 데미지 파이프라인 예고
5. 고급 2편: `Damage GameplayEffect`, `GameplayCue`, 실제 타겟 HP 감소 흐름

## 초급

처음 읽는다면 타입 이름을 다 외우지 말고, 각 편이 "무슨 역할을 하나"만 먼저 잡아도 충분하다.

- [01. 이벤트 공격이 Ability로 들어오는 흐름](./01_beginner_event_to_asc_and_attribute/)
  공격 입력이 GAS Ability까지 전달되는 큰 흐름을 먼저 잡는다. `GameplayEvent`, `SourceASC`, `SourceAttr`는 그다음에 읽어도 된다.

## 중급

- [02. ManaCost GameplayEffect와 SetByCaller](./02_intermediate_manacost_effect_and_setbycaller/)
  마나 비용을 직접 깎지 않고 "비용 규칙"으로 분리하는 법을 설명한다. 세부 타입 이름은 `DurationPolicy`, `Modifier`, `SetByCaller` 정도만 따라가면 된다.

- [03. Spec 적용과 PostGameplayEffectExecute](./03_intermediate_spec_apply_and_post_execute/)
  실행용 복사본인 `Spec`에 이번 시전 비용을 넣고, 자기 자신에게 적용하는 실제 흐름을 정리한다.

## 고급

- [04. TargetData와 다음 데미지 이펙트 예고](./04_advanced_targetdata_and_damage_preview/)
  "맞은 대상 정보"를 꺼내 다음 데미지 처리로 넘기는 준비 단계를 설명한다. 여기부터는 용어가 조금 어려워져서 `01~03`을 읽고 오면 훨씬 쉽다.

- [05. Damage GameplayEffect와 GameplayCue로 실제 피해를 적용하는 흐름](./05_advanced_damage_effect_and_gameplaycue/)
  `GameplayAbility_Attack`이 만든 데미지 값을 `GameplayEffect_Damage`와 `GameplayCue.Battle.Attack`로 어떻게 마무리하는지 설명한다.

## 빠른 선택 가이드

- `260421`는 읽었는데 “그걸 우리 프로젝트에는 어디에 붙이는지”가 아직 안 잡힌다
  `01 -> 02 -> 03`
- `SetByCaller`가 실제로 왜 필요한지 헷갈린다
  `02`
- `SpecHandle`, `Spec`, `Data`가 뭐가 다른지 헷갈린다
  `03`
- 공격 이벤트에서 타겟 데이터가 넘어오는 구조를 먼저 보고 싶다
  `01`, `04`
- 다음 시간에 데미지 이펙트를 어디에 붙일지 미리 감을 잡고 싶다
  `04`
- 실제로 타겟 HP가 깎이고 타격 이펙트가 어디서 붙는지 끝까지 보고 싶다
  `04`, `05`

## 이 날짜의 핵심 목표

이번 날짜의 목표는 GAS 철학을 새로 배우는 것이 아니라, `GameplayEffect`가 실제 프로젝트 안에서 “값을 들고 다니는 규칙 객체”로 동작한다는 감각을 익히는 데 있다.

특히 아래 두 문장을 기억하면 좋다.

- `Ability는 값을 직접 바꾸지 않고 Effect를 만들어 실행한다.`
- `AttributeSet은 값 저장소이면서, Effect 적용 이후 후처리 지점이기도 하다.`

즉 `260422`는 `260421`의 개념 교재를 실전 코드로 번역하는 날짜다.
앞쪽 1~3편이 "비용과 적용 구조를 심는 단계"였다면, 새로 보강한 5편은 그 구조가 실제로 타겟 HP 감소와 `GameplayCue` 반응까지 어떻게 이어지는지 마무리한다.
