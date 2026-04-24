---
title: 260406 플레이어 C++ 전환과 입력 파이프라인 허브
---

# 260406 플레이어 C++ 전환과 입력 파이프라인 허브

[루트](../) | [이전 날짜: 260403](../260403/) | [다음 날짜: 260407](../260407/)

## 문서 개요

`260406`은 블루프린트로 먼저 실험하던 플레이어 구조를 C++ 클래스 체계로 끌어오는 날이다.
이번 날짜에서는 `APlayerCharacter`, `AShinbi`, `ADefaultGameMode`, `AMainPlayerController`, `UDefaultInputData`를 묶어서, 플레이어 진입점과 입력 파이프라인의 뼈대를 코드로 고정한다.

기존에는 한 파일로 정리되어 있었지만, 이번에는 강의 흐름에 맞춰 아래 다섯 편으로 분권했다.

![새 C++ 클래스 생성 메뉴](./assets/images/playerclass-wizard.jpg)

## 추천 읽기 순서

1. [초급 1편. PlayerCharacter와 Shinbi 클래스 계층](./01_beginner_playercharacter_and_shinbi_cpp_hierarchy/)
2. [중급 1편. DefaultGameMode와 InputData](./02_intermediate_defaultgamemode_and_inputdata/)
3. [중급 2편. Rotation, Jump, Attack 기본 루프](./03_intermediate_rotation_jump_attack_loop/)
4. [부록 1. 공식 문서로 다시 읽는 플레이어 구조](./04_appendix_official_docs_reference/)
5. [부록 2. 현재 프로젝트 C++로 다시 읽는 전환 구조](./05_appendix_current_project_cpp_reference/)

## 빠른 선택 가이드

- `APlayerCharacter`와 `AShinbi`를 왜 나누는지, 공통부와 개별부를 어떻게 분리하는지가 궁금하면 [초급 1편](./01_beginner_playercharacter_and_shinbi_cpp_hierarchy/)부터 읽으면 된다.
- `GameMode`, `PlayerController`, `UDefaultInputData`, `BeginPlay`, `SetupPlayerInputComponent` 흐름을 먼저 잡고 싶으면 [중급 1편](./02_intermediate_defaultgamemode_and_inputdata/)이 가장 직접적이다.
- `bUseControllerRotationYaw`, `RotationKey`, `JumpKey`, `AttackKey`, 테스트 발사체 프로토타입을 보고 싶으면 [중급 2편](./03_intermediate_rotation_jump_attack_loop/)으로 가면 된다.
- 공식 문서 기준 용어를 같이 보고 싶으면 [부록 1](./04_appendix_official_docs_reference/), 현재 `UE20252` branch 기준 차이까지 연결해서 보고 싶으면 [부록 2](./05_appendix_current_project_cpp_reference/)를 보면 된다.

## 이번 날짜의 핵심 목표

- 언리얼 플레이어 구조를 `Character`, `Controller`, `GameMode` 책임 분리로 읽을 수 있다.
- `APlayerCharacter`를 공통 베이스로 두고 `AShinbi`, `AWraith` 같은 파생 클래스로 외형과 개별 동작을 붙이는 이유를 설명할 수 있다.
- `UDefaultInputData`가 입력 자산 창고 역할을 하며, `CDO`를 통해 재사용되는 구조를 이해한다.
- `BeginPlay()`와 `SetupPlayerInputComponent()`가 각각 컨텍스트 등록과 액션 바인딩을 맡는다는 점을 구분할 수 있다.
- `Rotation`, `Jump`, `Attack`이 이후 애니메이션과 전투 시스템이 올라갈 입력 골조라는 점을 이해한다.

## 사용한 자료

- `D:\UE_Academy_Stduy_compressed\260406_1_플레이어 C++ 클래스 생성.mp4`
- `D:\UE_Academy_Stduy_compressed\260406_2_입력 시스템 C++ 변환.mp4`
- `D:\UE_Academy_Stduy_compressed\260406_3_플레이어 회전 점프 공격.mp4`
- `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 이번 분권에서 보강한 포인트

- 기존 통합 문서를 `클래스 계층 -> GameMode/InputData -> 기본 조작 루프` 순서로 나눠 읽기 부담을 줄였다.
- 기존 이미지 11장을 각 편의 맥락에 맞게 재배치했다.
- `PlayerCharacter 생성 다이얼로그`, `AddMappingContext 코드`, `BindAction 코드`, `SpawnActor 코드` 화면을 새 스크린샷으로 추가했다.
- 현재 branch에서는 `ADefaultGameMode`의 기본 폰이 `AShinbi`에서 `AShinbiGAS`로 발전했다는 차이를 문서에 추적 메모로 반영했다.

## 현재 branch 추적 메모

`260406` 강의의 원형은 `APlayerCharacter -> AShinbi/AWraith -> ADefaultGameMode` 축이다.
다만 현재 `UE20252`의 [DefaultGameMode.cpp](</D:/UnrealProjects/UE_Academy_Stduy/Source/UE20252/GameMode/DefaultGameMode.cpp>)는 기본 폰을 `AShinbiGAS`로 두고 있다.
즉 강의의 C++ 전환 구조가 사라진 것은 아니고, 이후 GAS 플레이어 라인으로 한 단계 더 확장된 상태라고 보는 편이 정확하다.

## 읽기 메모

이번 날짜는 전투를 완성하는 날보다, 이후 `260407` 애니메이션, `260408` 콤보, `260409` 피격/연출, `260421~260423` GAS 구조가 기대는 플레이어 입력 골조를 세우는 날에 가깝다.
