---
title: 260408 공격 몽타주, 노티파이, 콤보 섹션, 애니메이션 템플릿
---

# 260408 공격 몽타주, 노티파이, 콤보 섹션, 애니메이션 템플릿

[← 260407](../260407/) | [루트 허브](../index.md) | [260409 →](../260409/)

## 문서 개요

`260408`은 플레이어 공격을 "버튼을 누르면 바로 데미지"가 아니라 `애니메이션 시간축으로 제어되는 전투 구조`로 올리는 날이다.
이번 날짜의 흐름은 크게 세 덩어리로 나뉜다.

1. `AnimMontage + Slot`으로 로코모션 위에 공격을 얹는다.
2. `Notify`와 `UAnimNotify`로 정확한 프레임에 입력 창구와 실제 판정을 연다.
3. `Combo Section + Animation Template`로 이 구조를 캐릭터 공용 규약으로 만든다.

이번 허브는 기존 통합 문서를 강의 흐름 기준으로 다시 나누고, 현재 `UE20252` branch에서 달라진 코드 지점도 함께 추적해 정리한 것이다.

## 학습 순서

1. [01 AnimMontage와 Slot 구조](./01_beginner_animmontage_and_slot_structure/)
2. [02 Animation Notify와 커스텀 노티파이](./02_intermediate_animation_notifies_and_custom_notify/)
3. [03 콤보 섹션과 애니메이션 템플릿](./03_intermediate_combo_sections_and_animation_template/)
4. [04 공식 문서 부록](./04_appendix_official_docs_reference/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 단일 문서를 `몽타주/슬롯`, `노티파이`, `콤보/템플릿`, `공식 문서`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 9장을 각 문맥에 맞게 재배치했다.
- 강의 캡처에서 대표 컷 5장을 새로 골라 `NativeBeginPlay`, `UAnimNotify` 시그니처, `PlayAttack()`의 콤보 분기, 템플릿 필드 선언, 전이 규칙 그래프를 보강했다.
- 현재 branch 기준으로 `UPlayerAnimInstance::NativeUpdateAnimation()`, `UPlayerTemplateAnimInstance::AnimNotify_SkillCasting()`, `UAnimNotify_PlayerAttack::Notify()`가 `APlayerCharacter` 대신 `APlayerCharacterGAS`를 기준으로 동작한다는 점을 반영했다.

## 빠르게 보고 싶은 사람을 위한 길잡이

- 공격 애니메이션이 왜 상태 머신 바깥으로 빠져나오는지 먼저 보고 싶으면 `01`부터 읽는다.
- `ComboStart`, `ComboEnd`, `PlayerAttack`가 실제로 어떤 차이인지 궁금하면 `02`가 핵심이다.
- `Shinbi`와 `Wraith`가 같은 공격 규칙을 공유하면서도 결과가 달라지는 이유가 궁금하면 `03`과 `05`를 이어서 읽는다.

## 핵심 문장

`260408`의 본질은 전투 결과를 붙이는 날이 아니라, `입력과 실제 타격 사이에 애니메이션 시간축을 끼워 넣는 법`을 배우는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260408_1~3`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260409](../260409/)에서는 여기서 만든 몽타주/노티파이/템플릿 구조 위에 실제 `NormalAttack`, `TakeDamage`, 파티클, 사운드, 원거리 공격 결과가 붙기 시작한다.

[← 260407](../260407/) | [루트 허브](../index.md) | [260409 →](../260409/)
