---
title: 260413 Mouse Picking, 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출 만들기
---

# 260413 Mouse Picking, 지정형 스킬, Geometry Collection으로 위치 기반 파괴 연출 만들기

[← 260410](../260410/) | [루트 허브](../index.md) | [260414 →](../260414/)

## 문서 개요

`260413`은 플레이어 공격을 "캐릭터 앞 방향으로만 나가는 행동"에서 `플레이어가 월드 특정 위치를 찍어 발동하는 행동`으로 확장하는 날이다.
이번 날짜의 흐름은 크게 다섯 덩어리로 나뉜다.

1. 컨트롤러에서 Mouse Picking 기반을 준비한다.
2. Shinbi가 마법진 데칼로 목표 지점을 미리 보여 준다.
3. 그 지점을 기준으로 스킬 액터를 생성한다.
4. Geometry Collection 자산과 C++ 액터를 연결해 실제 파괴 반응을 연다.
5. 마지막으로 현재 프로젝트 기준 전체 파이프라인을 다시 읽는다.

## 학습 순서

1. [01 Mouse Picking과 컨트롤러 세팅](./01_intermediate_mouse_picking_and_controller_setup/)
2. [02 스킬 캐스팅 마커와 목표 지정](./02_intermediate_skill_casting_marker_and_targeting/)
3. [03 Geometry Collection 에디터 워크플로](./03_intermediate_geometry_collection_editor_workflow/)
4. [04 Geometry Collection C++와 External Strain](./04_intermediate_geometry_collection_cpp_and_external_strain/)
5. [05 현재 프로젝트 C++ 부록](./05_appendix_current_project_cpp_reference/)

## 이번 분권에서 보강한 내용

- 기존 통합 문서를 `Mouse Picking`, `스킬 캐스팅`, `Geometry Collection`, `Geometry Collection C++`, `현재 프로젝트 C++` 다섯 편으로 분리했다.
- 기존 이미지 12장을 각 문맥에 맞게 재배치했다.
- 강의 캡처에서 `Mouse Picking 런타임`, `마법진 미리보기`, `GeometryActor 실제 배치` 컷 3장을 새로 추가했다.
- 현재 branch 기준으로 `MainPlayerController` 실제 위치가 `Player/` 폴더라는 점, `UE20252.Build.cs`에 `Niagara` 모듈도 추가돼 있다는 점, `ShinbiGAS` 쪽 지정형 스킬 확정 분기가 일부 주석 처리돼 있다는 점을 함께 반영했다.

## 현재 branch 추적 메모

`260413`의 뼈대는 여전히 유효하지만, 현재 저장소는 두 층이 함께 있다.

- legacy 쪽: `AMainPlayerController`, `AShinbi`, `AGeometryActor`
- GAS 쪽: `APlayerCharacterGAS`, `AShinbiGAS`

특히 `Mouse Picking`, `ADecalBase`, `AGeometryActor` 쪽은 여전히 legacy 예제가 가장 직관적이다.
반면 `AnimInstance`와 일부 공격 흐름은 GAS 플레이어 라인과 함께 읽어야 최신 branch 그림이 맞는다.

## 핵심 문장

`260413`의 본질은 기술 하나를 만드는 것이 아니라, `Pick -> Preview -> Spawn -> React`라는 위치 기반 스킬의 전체 파이프라인을 처음으로 연결하는 데 있다.

## 자료

- 원본 영상: `D:\UE_Academy_Stduy_compressed\260413_1~4`
- 실제 코드: `D:\UnrealProjects\UE_Academy_Stduy\Source\UE20252`
- 덤프 자료: `D:\UnrealProjects\UE_Academy_Stduy\Saved\AcademyUtility`

## 다음 단계

다음 날짜 [260414](../260414/)부터는 몬스터 베이스, AIController, Behavior Tree, DataTable, AssetManager 쪽으로 축이 넘어가면서, 지금까지 만든 플레이어 전투 구조와 AI 구조가 만날 준비가 시작된다.

[← 260410](../260410/) | [루트 허브](../index.md) | [260414 →](../260414/)
