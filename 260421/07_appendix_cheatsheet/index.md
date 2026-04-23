---
title: 260421 부록 - GAS 함수 치트시트와 추천 파일 순서
---

# 부록. GAS 함수 치트시트와 추천 파일 순서

[이전: 고급 2편](../06_advanced_playerstate_and_multiplayer/) | [허브](../)

## 가장 먼저 외울 GAS 함수

- `CanActivateAbility()`
  지금 쓸 수 있는지 검사
- `ActivateAbility()`
  Ability 시작
- `CommitAbility()`
  코스트와 쿨다운 확정
- `EndAbility()`
  정상 종료
- `CancelAbility()`
  중간 취소
- `InputReleased()`
  버튼 해제 시점 처리
- `MakeOutgoingGameplayEffectSpec()`
  적용할 EffectSpec 준비
- `ApplyGameplayEffectSpecToTarget()`
  대상에게 Effect 적용
- `PreAttributeChange()`
  값 변경 직전 보정
- `PostGameplayEffectExecute()`
  Effect 적용 직후 후처리

## 함수 흐름 한 줄

`쓸 수 있나 -> 시작 -> 확정 -> 효과 적용 -> 값 반영 -> 종료`

## GASDocumentation 예제 프로젝트 추천 파일 순서

1. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Abilities\GDGA_CharacterJump.cpp`
2. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Public\Characters\Abilities\GDGameplayAbility.h`
3. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Public\Characters\Abilities\AttributeSets\GDAttributeSetBase.h`
4. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Abilities\AttributeSets\GDAttributeSetBase.cpp`
5. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\GDCharacterBase.cpp`
6. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Heroes\Abilities\GDGA_FireGun.cpp`
7. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Abilities\GDDamageExecCalculation.cpp`
8. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Player\GDPlayerState.cpp`
9. `D:\UnrealProjects\GASDocumentation\Source\GASDocumentation\Private\Characters\Heroes\GDHeroCharacter.cpp`

## UE20252 대응 추천 덤프 순서

이번 개정은 `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility` 덤프를 기준으로 보강했다.
실제 프로젝트 축을 따라 읽고 싶다면 아래 순서가 가장 덜 헷갈린다.

1. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\InputData_SourceDump.txt`
2. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\PlayerCharacterGAS_SourceDump.txt`
3. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\ShinbiGAS_SourceDump.txt`
4. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\GameplayAbility_Attack_SourceDump.txt`
5. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\GameplayAbility_Base_SourceDump.txt`
6. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\GameplayEffect_ManaCost_SourceDump.txt`
7. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\BaseAttributeSet_SourceDump.txt`
8. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\PlayerAttributeSet_SourceDump.txt`
9. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\MainPlayerState_SourceDump.txt`
10. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\DT_PlayerInfo_AssetDump.txt`
11. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\PDA_PlayerInfo_AssetDump.txt`
12. `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility\DefaultGameplayTags_GameplayTagsDump.txt`

이 순서는 대략 아래 감각으로 이어진다.

`입력 연결 -> Character의 ASC -> 공격 이벤트 -> Ability -> Effect -> Attribute -> PlayerState 데이터 공급 -> 태그 확인`

## 초보자 추천 학습 루트

- 정말 처음이면
  `01 -> 02 -> 03`
- Ability와 Effect 차이가 헷갈리면
  `02 -> 03 -> 05`
- 시작 스탯과 시작 Ability 위치가 궁금하면
  `04`
- 멀티플레이 구조까지 보고 싶으면
  `06`

## 복습 질문

1. `Ability`와 `Effect` 차이를 한 문장으로 설명할 수 있는가?
2. `CommitAbility()`가 왜 중요한가?
3. `Damage` 메타 Attribute를 두는 이유는 무엇인가?
4. 시작 스탯과 시작 Ability는 어디서 들어가는가?
5. 왜 이 예제는 `PlayerState`에 ASC를 두는가?

## 권장 과제

1. `UGDGA_CharacterJump`를 참고해서 `대시 Ability` 흐름을 직접 적어 본다.
2. `UGDAttributeSetBase`에 `Shield`를 추가한다고 가정하고 수정 지점을 체크해 본다.
3. `FireGun`의 피해량을 공격력 Attribute 기반으로 바꾼다고 가정하고 어떤 값을 캡처해야 할지 정리해 본다.
4. `State.Stunned` 태그가 붙었을 때 점프와 총쏘기를 막는 규칙을 어디에 넣을지 비교해 본다.

## 공식 문서 바로가기

- [공식 문서 참고 가이드](../08_appendix_official_docs_reference/)
  이번 교재에서 사용한 Epic 공식 문서를 한곳에 모아 두었다.
