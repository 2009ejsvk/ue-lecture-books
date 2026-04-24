---
title: 260407 애니메이션 블루프린트와 플레이어 로코모션 허브
---

# 260407 애니메이션 블루프린트와 플레이어 로코모션 허브

[루트](../) | [이전 날짜: 260406](../260406/) | [다음 날짜: 260408](../260408/)

## 문서 개요

`260407`은 `260406`에서 만든 플레이어 C++ 구조 위에 처음으로 "움직이는 몸"을 올리는 날이다.
이번 날짜에서는 `AnimInstance`, `Aim Offset`, `GroundLocomotion`, `Blend Space`, `Jump` 상태 머신을 묶어서 플레이어 로코모션의 기초를 만든다.

기존에는 한 파일로 정리되어 있었지만, 이번에는 강의 흐름에 맞춰 아래 여섯 편으로 분권했다.

![기본 애님 블루프린트 그래프](./assets/images/animbp-basic-graph.jpg)

## 추천 읽기 순서

1. [초급 1편. Animation Blueprint와 AnimInstance](./01_beginner_animation_blueprint_and_animinstance/)
2. [중급 1편. Aim Offset과 시선 변수](./02_intermediate_aim_offset_and_view_variables/)
3. [중급 2편. GroundLocomotion과 Blend Space](./03_intermediate_groundlocomotion_blendspace_and_yawdelta/)
4. [중급 3편. Jump 상태 머신과 캐시 포즈](./04_intermediate_jump_state_machine_and_cached_pose/)
5. [부록 1. 공식 문서로 다시 읽는 애님 구조](./05_appendix_official_docs_reference/)
6. [부록 2. 현재 프로젝트 C++로 다시 읽는 애님 파이프라인](./06_appendix_current_project_cpp_reference/)

## 빠른 선택 가이드

- `AnimBlueprint`와 `AnimInstance`를 왜 같이 써야 하는지, 중간 C++ 레이어가 왜 필요한지가 궁금하면 [초급 1편](./01_beginner_animation_blueprint_and_animinstance/)부터 읽으면 된다.
- `Aim Offset`, `ViewPitch`, `ViewYaw`, `RotationKey` 연결을 먼저 잡고 싶으면 [중급 1편](./02_intermediate_aim_offset_and_view_variables/)이 가장 직접적이다.
- `GroundLocomotion`, `Idle/JogStart/Run/JogStop`, `Blend Space`, `mYawDelta`가 궁금하면 [중급 2편](./03_intermediate_groundlocomotion_blendspace_and_yawdelta/)으로 가면 된다.
- `JumpStart`, `JumpApex`, `JumpLand`, `Save Cached Pose`, `Apply Additive`를 보고 싶으면 [중급 3편](./04_intermediate_jump_state_machine_and_cached_pose/)을 보면 된다.
- 공식 문서 기준 용어와 자습 순서를 보고 싶으면 [부록 1](./05_appendix_official_docs_reference/), 현재 `UE20252` branch 기준 차이까지 연결해서 읽고 싶으면 [부록 2](./06_appendix_current_project_cpp_reference/)가 맞다.

## 이번 날짜의 핵심 목표

- `UPlayerAnimInstance`와 `UPlayerTemplateAnimInstance`가 어떤 공통 책임을 나눠 갖는지 이해한다.
- `mMoveSpeed`, `mViewPitch`, `mViewYaw`, `mIsInAir`, `mAccelerating`, `mYawDelta`가 각각 어떤 질문에 답하는 변수인지 설명할 수 있다.
- `Aim Offset`, `Blend Space`, `State Machine`이 서로 다른 문제를 푸는 자산이라는 점을 구분할 수 있다.
- `GroundLoco` 캐시 포즈와 `Apply Additive`가 착지 복귀를 더 자연스럽게 만든다는 점을 이해한다.
- 현재 branch에서도 이 애님 구조가 GAS 플레이어 라인 위에서 계속 재사용되고 있다는 점을 읽을 수 있다.

## 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260407_1_애니메이션 블루프린트.mp4`
- `D:\UE_Academy_Stduy_compressed\260407_2_에임오프셋.mp4`
- `D:\UE_Academy_Stduy_compressed\260407_3_블렌드 스페이스와 회전이동.mp4`
- `D:\UE_Academy_Stduy_compressed\260407_4_플레이어 점프.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 이번 분권에서 보강한 포인트

- 기존 통합 문서를 `AnimInstance -> Aim Offset -> GroundLocomotion -> Jump` 흐름으로 나눠 읽기 부담을 줄였다.
- 기존 이미지 10장을 각 편의 맥락에 맞게 재배치했다.
- `부모 AnimInstance 선택`, `ViewPitch/ViewYaw 코드`, `YawDelta 계산 그래프`, `JumpLand Apply Additive` 화면을 새 스크린샷으로 추가했다.
- 현재 branch에서 `UPlayerAnimInstance`와 `UPlayerTemplateAnimInstance`가 `APlayerCharacter`가 아니라 `APlayerCharacterGAS`를 바라보는 차이도 추적 메모로 반영했다.

## 현재 branch 추적 메모

강의 원형은 `APlayerCharacter -> UPlayerAnimInstance -> AnimBlueprint` 축을 중심으로 설명한다.
다만 현재 [PlayerAnimInstance.cpp](</D:/UnrealProjects/UE_Academy_Stduy/Source/UE20252/Player/PlayerAnimInstance.cpp>)와 [PlayerTemplateAnimInstance.cpp](</D:/UnrealProjects/UE_Academy_Stduy/Source/UE20252/Player/PlayerTemplateAnimInstance.cpp>)는 `TryGetPawnOwner()`를 `APlayerCharacterGAS`로 캐스팅한다.
즉 애님 파이프라인 자체는 유지되고, 그 위에 붙는 플레이어 베이스가 GAS 라인으로 한 단계 확장된 상태라고 보는 편이 정확하다.

## 읽기 메모

이번 날짜는 예쁜 움직임을 만드는 날이기도 하지만, 더 본질적으로는 `260408`의 몽타주/노티파이, `260409`의 전투 애니메이션, 이후 GAS 플레이어 몽타주까지 받아낼 애님 파이프라인을 세우는 날에 가깝다.
